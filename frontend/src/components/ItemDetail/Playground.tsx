import React, { useState, useCallback, useRef, useEffect } from 'react';

interface PlaygroundImage {
    id: string;
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

interface PlaygroundProps {
    initialImages?: PlaygroundImage[];
    onSave?: (images: PlaygroundImage[]) => void;
}

export const Playground: React.FC<PlaygroundProps> = ({ initialImages = [], onSave }) => {
    const [images, setImages] = useState<PlaygroundImage[]>(initialImages);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [resizingId, setResizingId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [isDragOver, setIsDragOver] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setImages(initialImages);
    }, [initialImages]);

    // Handle file drop from external sources
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                const newImage: PlaygroundImage = {
                    id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    src: reader.result as string,
                    x: e.nativeEvent.offsetX - 75,
                    y: e.nativeEvent.offsetY - 75,
                    width: 150,
                    height: 150
                };
                setImages(prev => {
                    const updated = [...prev, newImage];
                    onSave?.(updated);
                    return updated;
                });
            };
            reader.readAsDataURL(file);
        });
    }, [onSave]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    // Handle file input change
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                const newImage: PlaygroundImage = {
                    id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    src: reader.result as string,
                    x: 50 + Math.random() * 100,
                    y: 50 + Math.random() * 100,
                    width: 150,
                    height: 150
                };
                setImages(prev => {
                    const updated = [...prev, newImage];
                    onSave?.(updated);
                    return updated;
                });
            };
            reader.readAsDataURL(file);
        });

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [onSave]);

    // Handle drag start for moving images
    const handleMouseDown = useCallback((e: React.MouseEvent, imageId: string) => {
        e.preventDefault();
        e.stopPropagation();

        const image = images.find(img => img.id === imageId);
        if (image && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left - image.x,
                y: e.clientY - rect.top - image.y
            });
            setDraggingId(imageId);
        }
    }, [images]);

    // Handle resize start
    const handleResizeMouseDown = useCallback((e: React.MouseEvent, imageId: string) => {
        e.preventDefault();
        e.stopPropagation();

        const image = images.find(img => img.id === imageId);
        if (image) {
            setResizeStart({
                x: e.clientX,
                y: e.clientY,
                width: image.width,
                height: image.height
            });
            setResizingId(imageId);
        }
    }, [images]);

    // Handle mouse move for dragging and resizing
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (draggingId && canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                const newX = e.clientX - rect.left - dragOffset.x;
                const newY = e.clientY - rect.top - dragOffset.y;

                setImages(prev => prev.map(img =>
                    img.id === draggingId
                        ? { ...img, x: Math.max(0, newX), y: Math.max(0, newY) }
                        : img
                ));
            }

            if (resizingId) {
                const deltaX = e.clientX - resizeStart.x;
                const deltaY = e.clientY - resizeStart.y;
                const newWidth = Math.max(50, resizeStart.width + deltaX);
                const newHeight = Math.max(50, resizeStart.height + deltaY);

                setImages(prev => prev.map(img =>
                    img.id === resizingId
                        ? { ...img, width: newWidth, height: newHeight }
                        : img
                ));
            }
        };

        const handleMouseUp = () => {
            if (draggingId || resizingId) {
                // Save current state
                setImages(currentImages => {
                    onSave?.(currentImages);
                    return currentImages;
                });
                setDraggingId(null);
                setResizingId(null);
            }
        };

        if (draggingId || resizingId) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [draggingId, resizingId, dragOffset, resizeStart, onSave]);

    const handleDelete = useCallback((e: React.MouseEvent, imageId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setImages(prev => {
            const updated = prev.filter(img => img.id !== imageId);
            onSave?.(updated);
            return updated;
        });
    }, [onSave]);

    const handleCanvasClick = useCallback(() => {
        if (images.length === 0 && fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, [images.length]);

    return (
        <div className="playground">
            <div className="playground__header">
                <span className="playground__title">Playground</span>
                <span className="playground__hint">Drag images to move, use corner to resize</span>
            </div>
            <div
                ref={canvasRef}
                className={`playground__canvas ${isDragOver ? 'playground__canvas--active' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleCanvasClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                />

                {images.length === 0 && (
                    <div className="playground__empty">
                        <span className="material-icons" style={{ fontSize: '48px', color: '#ccc' }}>add_photo_alternate</span>
                        <p>Drag and drop images here or click to upload</p>
                    </div>
                )}

                {images.map(image => (
                    <div
                        key={image.id}
                        className={`playground__image ${draggingId === image.id ? 'playground__image--dragging' : ''} ${resizingId === image.id ? 'playground__image--resizing' : ''}`}
                        style={{
                            left: image.x,
                            top: image.y,
                            width: image.width,
                            height: image.height
                        }}
                        onMouseDown={(e) => handleMouseDown(e, image.id)}
                    >
                        <img src={image.src} alt="" draggable={false} />
                        <button
                            className="playground__image-delete"
                            onClick={(e) => handleDelete(e, image.id)}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <span className="material-icons">close</span>
                        </button>
                        <div
                            className="playground__image-resize"
                            onMouseDown={(e) => handleResizeMouseDown(e, image.id)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
