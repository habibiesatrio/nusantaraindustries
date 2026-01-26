import { ref, get, set, child, remove, update } from 'firebase/database';
import { rtdb } from './firebase';

const sanitizeData = (data) => {
    const clean = {};
    const allowedKeys = [
        'Harmony_ID', 'Parent_ID', 'HS_Code', 'Product_Name', 
        'Desc', 'Process_Name', 'Tier', 'Export_Value', 
        'Import_Value', 'Market_Value_Technology', 'Parents', 'Origin_Score_Value'
    ];
    Object.keys(data).forEach(key => {
        if (allowedKeys.includes(key) && data[key] !== undefined) {
            clean[key] = data[key];
        }
    });
    return clean;
};

export const saveToFirebase = async (formData, mode) => {
    const dbRef = ref(rtdb);
    const cleanFormData = sanitizeData(formData);
    try {
        const snapshot = await get(dbRef);
        let dataVal = snapshot.val();
        let currentData = dataVal ? (Array.isArray(dataVal) ? dataVal.filter(i => i !== null) : Object.values(dataVal)) : [];

        if (mode === 'edit') {
            const index = currentData.findIndex(item => item && item.Harmony_ID === cleanFormData.Harmony_ID);
            if (index !== -1) {
                const existingItem = currentData[index];
                await set(child(dbRef, `/${index}`), { ...existingItem, ...cleanFormData, Parents: existingItem.Parents || [] });
                return true;
            }
        } else { 
            const newIndex = currentData.length;
            await set(child(dbRef, `/${newIndex}`), { ...cleanFormData, Parents: [] });
            return true;
        }
    } catch (error) {
        throw error;
    }
};

export const createRelationship = async (sourceId, targetId) => {
    const dbRef = ref(rtdb);
    const snapshot = await get(dbRef);
    let dataVal = snapshot.val();
    let currentData = dataVal ? (Array.isArray(dataVal) ? dataVal.filter(i => i !== null) : Object.values(dataVal)) : [];
    const targetIndex = currentData.findIndex(item => item && item.Harmony_ID === targetId);
    if (targetIndex !== -1) {
        const targetItem = currentData[targetIndex];
        let currentParents = targetItem.Parents || [];
        if (!currentParents.some(p => p.Harmony_ID === sourceId)) {
            const updatedParents = [...currentParents, { Harmony_ID: sourceId, Process_Name: `Process from ${sourceId}` }];
            await update(child(dbRef, `/${targetIndex}`), { Parents: updatedParents });
            return true;
        }
    }
    return false;
};

export const deleteFromFirebase = async (nodeData) => {
    const dbRef = ref(rtdb);
    try {
        const snapshot = await get(dbRef);
        if (!snapshot.exists()) return;
        const dataVal = snapshot.val();
        const currentData = Array.isArray(dataVal) ? dataVal : Object.values(dataVal);
        const filteredData = currentData.filter(item => item && item.Harmony_ID !== nodeData.Harmony_ID);
        await set(dbRef, filteredData);
    } catch (error) { throw error; }
};