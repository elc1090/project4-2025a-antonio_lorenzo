const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const authMiddleware = require('../middleware/authMiddleware');

// Criar uma viagem
router.post('/', authMiddleware, async (req, res) => {
  const { title, destination, startDate, endDate } = req.body;
  const userId = req.user.userId;

  if (!title || !destination || !startDate || !endDate) {
    return res.status(400).json({ message: 'Dados incompletos' });
  }

  try {
    const trip = await Trip.create({ title, destination, startDate, endDate, userId });
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar viagem', error: err.message });
  }
});

// Listar todas viagens do usuário
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  try {
    const trips = await Trip.findAll({ where: { userId } });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar viagens', error: err.message });
  }
});

// Buscar viagem específica do usuário
router.get('/:id', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const tripId = req.params.id;

  try {
    const trip = await Trip.findOne({ where: { id: tripId, userId } });
    if (!trip) return res.status(404).json({ message: 'Viagem não encontrada' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar viagem', error: err.message });
    console.error(err);
  }
});

// Atualizar viagem
router.put('/:id', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const tripId = req.params.id;
  const { title, destination, startDate, endDate } = req.body;

  try {
    const trip = await Trip.findOne({ where: { id: tripId, userId } });
    if (!trip) return res.status(404).json({ message: 'Viagem não encontrada' });

    await trip.update({ title, destination, startDate, endDate });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar viagem', error: err.message });
    console.error(err);
  }
});

// Deletar viagem
router.delete('/:id', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const tripId = req.params.id;

  try {
    const trip = await Trip.findOne({ where: { id: tripId, userId } });
    if (!trip) return res.status(404).json({ message: 'Viagem não encontrada' });

    await trip.destroy();
    res.json({ message: 'Viagem deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao deletar viagem', error: err.message });
    console.error(err);
  }
});

module.exports = router;
