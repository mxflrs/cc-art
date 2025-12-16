import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Dashboard/Card';
import { Grid } from '../components/Dashboard/Grid';
import { SplitLayout } from '../components/Dashboard/SplitLayout';
import { ContextSidebar } from '../components/Dashboard/ContextSidebar';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Breadcrumbs } from '../components/Dashboard/Breadcrumbs';
import { cardService } from '../services/cardService';
import type { Topic, Style, Place, Item } from '../types/card';

type Level = 'TOPIC' | 'STYLE' | 'PLACE' | 'ITEM';

const PREDEFINED_PLACES = ['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Dining Room', 'Office', 'Garage', 'Garden', 'Other'];

export const Dashboard: React.FC = () => {
    const { topicId, styleId, placeId } = useParams<{ topicId?: string; styleId?: string; placeId?: string }>();
    const navigate = useNavigate();

    const [topics, setTopics] = useState<Topic[]>([]);
    const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
    const [currentStyle, setCurrentStyle] = useState<Style | null>(null);
    const [currentPlace, setCurrentPlace] = useState<Place | null>(null);

    // Data for current view
    const [stylesList, setStylesList] = useState<Style[]>([]);
    const [places, setPlaces] = useState<Place[]>([]);
    const [items, setItems] = useState<Item[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: number, type: Level } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const [modalName, setModalName] = useState('');
    const [modalWidth, setModalWidth] = useState('');
    const [modalHeight, setModalHeight] = useState('');
    const [modalImage, setModalImage] = useState<File | null>(null);
    const [selectedPlaceType, setSelectedPlaceType] = useState(PREDEFINED_PLACES[0]);

    // Determine current level based on URL params
    let level: Level = 'TOPIC';
    if (placeId) level = 'ITEM';
    else if (styleId) level = 'PLACE';
    else if (topicId) level = 'STYLE';

    // Dropzone
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setModalImage(acceptedFiles[0]);
        }
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false
    });

    const fetchData = useCallback(async () => {
        try {
            const allTopics = await cardService.getTopics();
            setTopics(allTopics);

            if (topicId) {
                const topic = allTopics.find(t => t.id === Number(topicId));
                if (topic) {
                    setCurrentTopic(topic);
                    setStylesList(topic.styles || []);

                    if (styleId) {
                        const style = topic.styles?.find(s => s.id === Number(styleId));
                        if (style) {
                            setCurrentStyle(style);
                            setPlaces(style.places || []);

                            if (placeId) {
                                const place = style.places?.find(p => p.id === Number(placeId));
                                if (place) {
                                    setCurrentPlace(place);
                                    setItems(place.items || []);
                                }
                            } else {
                                setCurrentPlace(null);
                            }
                        }
                    } else {
                        setCurrentStyle(null);
                        setCurrentPlace(null);
                    }
                }
            } else {
                setCurrentTopic(null);
                setCurrentStyle(null);
                setCurrentPlace(null);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        }
    }, [topicId, styleId, placeId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = async () => {
        let nameToCreate = modalName;

        if (level === 'PLACE') {
            if (selectedPlaceType !== 'Other') {
                nameToCreate = selectedPlaceType;
            } else if (!modalName) {
                alert('Please enter a name for the place');
                return;
            }
        } else if (!modalName) {
            return;
        }

        try {
            if (isEditing && editId) {
                // Handle Update logic here (placeholder for now as requested)
                console.log('Update feature triggered for', editId, nameToCreate);
                alert('Update feature coming soon!');
            } else {
                if (level === 'TOPIC') {
                    await cardService.createTopic(nameToCreate);
                } else if (level === 'STYLE' && currentTopic) {
                    await cardService.createStyle(nameToCreate, currentTopic.id);
                } else if (level === 'PLACE' && currentStyle) {
                    await cardService.createPlace(nameToCreate, currentStyle.id);
                } else if (level === 'ITEM' && currentPlace) {
                    if (!modalWidth || !modalHeight) {
                        alert('Width and Height are required');
                        return;
                    }
                    const formData = new FormData();
                    formData.append('name', nameToCreate);
                    formData.append('width', modalWidth);
                    formData.append('height', modalHeight);
                    formData.append('placeId', currentPlace.id.toString());
                    if (modalImage) {
                        formData.append('image', modalImage);
                    }
                    await cardService.createItem(formData);
                }
            }
            fetchData();
            closeModal();
        } catch (error) {
            console.error('Operation failed', error);
            alert('Failed to save');
        }
    };

    const openModal = () => {
        setModalName('');
        setModalWidth('');
        setModalHeight('');
        setModalImage(null);
        setSelectedPlaceType(PREDEFINED_PLACES[0]);
        setIsEditing(false);
        setEditId(null);
        setIsModalOpen(true);
    };

    const handleEdit = (e: React.MouseEvent, item: any, type: Level) => {
        e.stopPropagation();
        setModalName(item.name);
        if (type === 'ITEM') {
            setModalWidth(item.width);
            setModalHeight(item.height);
        }
        setIsEditing(true);
        setEditId(item.id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setEditId(null);
    };

    const handleDeleteClick = (e: React.MouseEvent, id: number, type: Level) => {
        e.stopPropagation();
        setItemToDelete({ id, type });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            if (itemToDelete.type === 'TOPIC') await cardService.deleteTopic(itemToDelete.id);
            else if (itemToDelete.type === 'ITEM') await cardService.deleteItem(itemToDelete.id);
            fetchData();
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleNavigate = (targetLevel: Level) => {
        // This function is mainly for the sidebar back navigation
        if (targetLevel === 'TOPIC') {
            navigate('/');
        } else if (targetLevel === 'STYLE' && currentTopic) {
            navigate(`/topic/${currentTopic.id}`);
        } else if (targetLevel === 'PLACE' && currentTopic && currentStyle) {
            navigate(`/topic/${currentTopic.id}/style/${currentStyle.id}`);
        }
    };

    // Generate breadcrumbs
    const breadcrumbs = [
        { label: 'Dashboard', onClick: () => navigate('/') }
    ];

    if (currentTopic) {
        breadcrumbs.push({ label: currentTopic.name, onClick: () => navigate(`/topic/${currentTopic.id}`) });
    }
    if (currentStyle) {
        breadcrumbs.push({ label: currentStyle.name, onClick: () => navigate(`/topic/${currentTopic?.id}/style/${currentStyle.id}`) });
    }
    if (currentPlace) {
        breadcrumbs.push({ label: currentPlace.name, onClick: () => navigate(`/topic/${currentTopic?.id}/style/${currentStyle?.id}/place/${currentPlace.id}`) });
    }

    return (
        <SplitLayout
            sidebar={
                <ContextSidebar
                    currentTopic={currentTopic}
                    currentStyle={currentStyle}
                    currentPlace={currentPlace}
                    onNavigate={handleNavigate}
                    onCreateTopic={openModal}
                />
            }
        >
            <div style={{ padding: '0 24px' }}>
                <Breadcrumbs items={breadcrumbs} />
            </div>

            <div className="card-system-header">
                <h1>
                    {level === 'TOPIC' && 'Topics'}
                    {level === 'STYLE' && 'Styles'}
                    {level === 'PLACE' && 'Places'}
                    {level === 'ITEM' && 'Items'}
                </h1>
                <Button
                    onClick={openModal}
                    variant="primary"
                >
                    + Create New
                </Button>
            </div>

            <Grid>
                {level === 'TOPIC' && topics.length > 0 && topics.map(topic => (
                    <Card
                        key={topic.id}
                        title={topic.name}
                        alias={topic.alias}
                        subtitle={`${topic.styles?.length || 0} Styles`}
                        onClick={() => navigate(`/topic/${topic.id}`)}
                        onDelete={(e) => handleDeleteClick(e, topic.id, 'TOPIC')}
                        onEdit={(e) => handleEdit(e, topic, 'TOPIC')}
                    />
                ))}

                {level === 'TOPIC' && topics.length === 0 && (
                    <div className="card-system-empty-state">
                        <h2>No Topics Found</h2>
                        <p>To get started, create your first topic to begin organizing your art planner.</p>
                        <Button
                            onClick={openModal}
                            variant="primary"
                            style={{ marginTop: '1rem' }}
                        >
                            Create First Topic
                        </Button>
                    </div>
                )}

                {level === 'STYLE' && stylesList.map(style => (
                    <Card
                        key={style.id}
                        title={style.name}
                        alias={style.alias}
                        subtitle={`${style.places?.length || 0} Places`}
                        onClick={() => navigate(`/topic/${currentTopic?.id}/style/${style.id}`)}
                    />
                ))}

                {level === 'PLACE' && places.map(place => (
                    <Card
                        key={place.id}
                        title={place.name}
                        alias={place.alias}
                        subtitle={`${place.items?.length || 0} Items`}
                        onClick={() => navigate(`/topic/${currentTopic?.id}/style/${currentStyle?.id}/place/${place.id}`)}
                    />
                ))}

                {level === 'ITEM' && items.map(item => (
                    <Card
                        key={item.id}
                        title={item.name}
                        alias={`${currentTopic?.alias}${currentStyle?.alias}-${currentPlace?.alias}`} // A1-IV pattern
                        subtitle={`${item.width}x${item.height}`}
                        image={item.imageUrl ? `http://localhost:3000/uploads/${item.imageUrl}` : undefined}
                        onClick={() => navigate(`/topic/${currentTopic?.id}/style/${currentStyle?.id}/place/${currentPlace?.id}/item/${item.id}`)}
                        onDelete={(e) => handleDeleteClick(e, item.id, 'ITEM')}
                        onEdit={(e) => handleEdit(e, item, 'ITEM')}
                    />
                ))}
            </Grid>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={`${isEditing ? 'Edit' : 'Create New'} ${level.charAt(0) + level.slice(1).toLowerCase()}`}
                footer={
                    <>
                        <Button variant="secondary" onClick={closeModal} style={{ width: 'auto' }}>Cancel</Button>
                        <Button variant="primary" onClick={handleCreate} style={{ width: 'auto' }}>{isEditing ? 'Save' : 'Create'}</Button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {level === 'PLACE' ? (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '14px', color: '#333' }}>Place Type</label>
                                <select
                                    value={selectedPlaceType}
                                    onChange={(e) => setSelectedPlaceType(e.target.value)}
                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #E0E0E0' }}
                                >
                                    {PREDEFINED_PLACES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            {selectedPlaceType === 'Other' && (
                                <Input
                                    label="Custom Name"
                                    value={modalName}
                                    onChange={(e) => setModalName(e.target.value)}
                                    placeholder="Enter custom place name"
                                />
                            )}
                        </>
                    ) : (
                        <Input
                            label="Name"
                            value={modalName}
                            onChange={(e) => setModalName(e.target.value)}
                            placeholder={`Enter ${level.toLowerCase()} name`}
                        />
                    )}

                    {level === 'ITEM' && (
                        <>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <Input
                                    label="Width"
                                    value={modalWidth}
                                    onChange={(e) => setModalWidth(e.target.value)}
                                    placeholder="W"
                                    type="number"
                                />
                                <Input
                                    label="Height"
                                    value={modalHeight}
                                    onChange={(e) => setModalHeight(e.target.value)}
                                    placeholder="H"
                                    type="number"
                                />
                            </div>

                            <div
                                {...getRootProps()}
                                style={{
                                    border: '2px dashed #E0E0E0',
                                    borderRadius: '4px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: isDragActive ? '#fafafa' : 'transparent'
                                }}
                            >
                                <input {...getInputProps()} />
                                {modalImage ? (
                                    <p style={{ margin: 0 }}>Selected: {modalImage.name}</p>
                                ) : (
                                    <p style={{ margin: 0, color: '#999' }}>Drag & drop an image here, or click to select</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Delete"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} style={{ width: 'auto' }}>Cancel</Button>
                        <Button variant="primary" onClick={confirmDelete} style={{ width: 'auto', backgroundColor: '#d32f2f' }}>Delete</Button>
                    </>
                }
            >
                <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            </Modal>
        </SplitLayout>
    );
};
