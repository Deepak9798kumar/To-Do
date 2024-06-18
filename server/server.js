const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/Todo-List', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const Task = mongoose.model('Task', taskSchema);


app.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

app.post('/tasks', async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Task name is required' });
  }

  const task = new Task({ name });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
});

app.patch('/tasks/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (error) {
    next(error);
  }
});

app.delete('/tasks/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
