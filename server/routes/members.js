import express from 'express';
import { DeliveryMember } from '../models/DeliveryMember.js';

const router = express.Router();

// Get all members
router.get('/', async (req, res) => {
    try {
        const members = await DeliveryMember.find();
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add member
router.post('/', async (req, res) => {
    const memberData = req.body;
    if (!memberData.id) {
        memberData.id = Date.now().toString();
    }
    const member = new DeliveryMember(memberData);
    try {
        const newMember = await member.save();
        res.status(201).json(newMember);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update member
router.put('/:id', async (req, res) => {
    try {
        const updatedMember = await DeliveryMember.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        if (!updatedMember) return res.status(404).json({ message: 'Member not found' });
        res.json(updatedMember);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
