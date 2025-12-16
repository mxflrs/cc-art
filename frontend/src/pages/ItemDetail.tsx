import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ItemInfo } from '../components/ItemDetail/ItemInfo';
import { Playground } from '../components/ItemDetail/Playground';
import { cardService } from '../services/cardService';
import type { Item } from '../types/card';

export const ItemDetail = () => {
    const { topicId, styleId, placeId, itemId } = useParams<{
        topicId: string;
        styleId: string;
        placeId: string;
        itemId: string;
    }>();

    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItem = async () => {
            if (!itemId) return;
            try {
                const data = await cardService.getItem(Number(itemId));
                setItem(data);
            } catch (error) {
                console.error('Failed to fetch item:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [itemId]);

    const handlePlaygroundSave = useCallback(async (images: any[]) => {
        if (!itemId) return;
        try {
            await cardService.updateItemPlayground(Number(itemId), images);
        } catch (error) {
            console.error('Failed to save playground:', error);
        }
    }, [itemId]);

    if (loading) {
        return (
            <div className="item-detail">
                <div className="item-detail__loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="item-detail">
            <div className="item-detail__top">
                <ItemInfo
                    item={item}
                    topicId={topicId}
                    styleId={styleId}
                    placeId={placeId}
                />
            </div>
            <div className="item-detail__bottom">
                <Playground
                    initialImages={item?.playground || []}
                    onSave={handlePlaygroundSave}
                />
            </div>
        </div>
    );
};

export default ItemDetail;
