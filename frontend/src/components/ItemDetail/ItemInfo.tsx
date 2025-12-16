import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button';
import { Text } from '../Text';
import type { Item } from '../../types/card';

interface ItemInfoProps {
    item: Item | null;
    topicId?: string;
    styleId?: string;
    placeId?: string;
}

export const ItemInfo: React.FC<ItemInfoProps> = ({ item, topicId, styleId, placeId }) => {
    const navigate = useNavigate();

    if (!item) {
        return <div className="item-info">Loading...</div>;
    }

    const imageUrl = item.imageUrl ? `http://localhost:3000/uploads/${item.imageUrl}` : null;

    return (
        <div className="item-info">
            <div className="item-info__header">
                <Button
                    variant="secondary"
                    onClick={() => navigate(`/topic/${topicId}/style/${styleId}/place/${placeId}`)}
                    style={{ width: 'auto' }}
                >
                    ← Back to Items
                </Button>
            </div>

            <div className="item-info__content">
                <div className="item-info__image-container">
                    {imageUrl ? (
                        <img src={imageUrl} alt={item.name} className="item-info__image" />
                    ) : (
                        <div className="item-info__image-placeholder">
                            <span className="material-icons" style={{ fontSize: '64px', color: '#ccc' }}>image</span>
                        </div>
                    )}
                </div>

                <div className="item-info__details">
                    <Text variant="h2">{item.name}</Text>
                    <div className="item-info__meta">
                        <div className="item-info__meta-item">
                            <Text variant="caption">Dimensions</Text>
                            <Text variant="body">{item.width} × {item.height}</Text>
                        </div>
                        <div className="item-info__meta-item">
                            <Text variant="caption">ID</Text>
                            <Text variant="body">{item.id}</Text>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
