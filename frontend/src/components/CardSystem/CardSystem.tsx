import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from './Card';
import { Grid } from './Grid';
import { SplitLayout } from './SplitLayout';
import { ContextSidebar } from './ContextSidebar';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { Input } from '../Input';
import { cardService } from '../../services/cardService';
import type { Topic, Style, Place, Item } from '../../types/card';

type Level = 'TOPIC' | 'STYLE' | 'PLACE' | 'ITEM';

const PREDEFINED_PLACES = ['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Dining Room', 'Office', 'Garage', 'Garden', 'Other'];

export const CardSystem: React.FC = () => {
    const [level, setLevel] = useState<Level>('TOPIC');
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
    const [modalName, setModalName] = useState('');
    const [modalWidth, setModalWidth] = useState('');
    const [modalHeight, setModalHeight] = useState('');
    const [modalImage, setModalImage] = useState<File | null>(null);
    const [selectedPlaceType, setSelectedPlaceType] = useState(PREDEFINED_PLACES[0]);

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

    const fetchData = async () => {
        try {
            if (level === 'TOPIC') {
                const data = await cardService.getTopics();
                setTopics(data);
            } else if (level === 'STYLE' && currentTopic) {
                const allTopics = await cardService.getTopics();
                const topic = allTopics.find(t => t.id === currentTopic.id);
                if (topic) {
                    setTopics(allTopics);
                    setCurrentTopic(topic);
                    setStylesList(topic.styles || []);
                }
            } else if (level === 'PLACE' && currentStyle) {
                const allTopics = await cardService.getTopics();
                const topic = allTopics.find(t => t.id === currentTopic!.id);
                const style = topic?.styles?.find(s => s.id === currentStyle.id);
                if (style) {
                    setCurrentStyle(style);
                    setPlaces(style.places || []);
                }
            } else if (level === 'ITEM' && currentPlace) {
                const allTopics = await cardService.getTopics();
                const topic = allTopics.find(t => t.id === currentTopic!.id);
                const style = topic?.styles?.find(s => s.id === currentStyle!.id);
                const place = style?.places?.find(p => p.id === currentPlace.id);
                if (place) {
                    setCurrentPlace(place);
                    setItems(place.items || []);
                }
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        }
    };

    // Note: fetchData is called in the useEffect to sync data when navigation changes

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
            fetchData();
            closeModal();
        } catch (error) {
            console.error('Create failed', error);
            alert('Failed to create item');
        }
    };

    const openModal = () => {
        setModalName('');
        setModalWidth('');
        setModalHeight('');
        setModalImage(null);
        setSelectedPlaceType(PREDEFINED_PLACES[0]);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleDelete = async (e: React.MouseEvent, id: number, type: Level) => {
        e.stopPropagation();
        if (!confirm('Are you sure? This will delete all nested items.')) return;

        try {
            if (type === 'TOPIC') await cardService.deleteTopic(id);
            else if (type === 'ITEM') await cardService.deleteItem(id);
            fetchData();
        } catch (error) {
            console.error('Delete failed', error);
        }
    }

    const handleNavigate = (targetLevel: Level) => {
        setLevel(targetLevel);
        if (targetLevel === 'TOPIC') {
            setCurrentTopic(null);
            setCurrentStyle(null);
            setCurrentPlace(null);
        } else if (targetLevel === 'STYLE') {
            setCurrentStyle(null);
            setCurrentPlace(null);
        } else if (targetLevel === 'PLACE') {
            setCurrentPlace(null);
        }
    };

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
                        onClick={() => { setCurrentTopic(topic); setLevel('STYLE'); }}
                        onDelete={(e) => handleDelete(e, topic.id, 'TOPIC')}
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
                        onClick={() => { setCurrentStyle(style); setLevel('PLACE'); }}
                    />
                ))}

                {level === 'PLACE' && places.map(place => (
                    <Card
                        key={place.id}
                        title={place.name}
                        alias={place.alias}
                        subtitle={`${place.items?.length || 0} Items`}
                        onClick={() => { setCurrentPlace(place); setLevel('ITEM'); }}
                    />
                ))}

                {level === 'ITEM' && items.map(item => (
                    <Card
                        key={item.id}
                        title={item.name}
                        alias={`${currentTopic?.alias}${currentStyle?.alias}-${currentPlace?.alias}`} // A1-IV pattern
                        subtitle={`${item.width}x${item.height}`}
                        image={item.imageUrl ? `http://localhost:3000/uploads/${item.imageUrl}` : undefined}
                        onDelete={(e) => handleDelete(e, item.id, 'ITEM')}
                    />
                ))}
            </Grid>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={`Create New ${level.charAt(0) + level.slice(1).toLowerCase()}`}
                footer={
                    <>
                        <Button variant="secondary" onClick={closeModal} style={{ width: 'auto' }}>Cancel</Button>
                        <Button variant="primary" onClick={handleCreate} style={{ width: 'auto' }}>Create</Button>
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
        </SplitLayout>
    );
};
