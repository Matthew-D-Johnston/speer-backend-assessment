const express = require('express');
const authMiddleware = require('../utils/authMiddleware');
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
  searchNotes,
} = require('../controllers/noteController');

const router = express.Router();

// Authentication middleware
router.use(authMiddleware);

router.get('/', getNotes);
router.get('/search', searchNotes);
router.get('/:id', getNoteById);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.post('/:id/share', shareNote);

module.exports = router;
