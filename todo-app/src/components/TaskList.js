import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Document, Page, Text, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import './TaskList.css';
import logo from "../Image/shanture-log.png";

const styles = StyleSheet.create({
    page: {
        padding: 30,
    },
    taskItem: {
        margin: 10,
    },
    completed: {
        textDecoration: 'line-through',
    },
});

const TaskListDocument = ({ tasks = [] }) => (
    <Document>
        <Page style={styles.page}>
            {tasks.map((task) => (
                <Text key={task._id} style={task.completed ? styles.completed : styles.taskItem}>
                    {task.name} 
                </Text>
            ))}
        </Page>
    </Document>
);

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://localhost:5000/tasks');
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const addTask = async () => {
        if (newTask.trim()) {
            try {
                const response = await axios.post('http://localhost:5000/tasks', { name: newTask });
                setTasks([...tasks, response.data]);
                setNewTask('');
            } catch (error) {
                console.error('Error adding task:', error);
            }
        }
    };

    const toggleTask = async (id) => {
        try {
            const response = await axios.patch(`http://localhost:5000/tasks/${id}`);
            setTasks(
                tasks.map((task) =>
                    task._id === id ? { ...task, completed: response.data.completed } : task
                )
            );
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    };

    const deleteTask = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/tasks/${id}`);
            setTasks(tasks.filter((task) => task._id !== id));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    return (
        <div className="taskList">
            <img src={logo} alt="Shanture Logo" className="logo" />
            <h1>To-Do List</h1>
            <div className='field'>
                <textarea
                className='input-tex'
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="New Task"
                />
                <div className='text-button'>
                <button onClick={addTask}>Add Task</button>
                </div>             
            </div>
            {tasks.length > 0 ? (
                tasks.map((task) => (
                    <div key={task._id} className="taskItem">
                        <span className={task.completed ? 'completed' : ''}>
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task._id)}
                            />
                            {task.name}
                        </span>
                        <button className='delete-button' onClick={() => deleteTask(task._id)}>Delete</button>
                    </div>
                ))
            ) : (
                <p>No tasks available</p>
            )}
            <PDFDownloadLink document={<TaskListDocument tasks={tasks} />} fileName="tasks.pdf">
                {({ blob, url, loading, error }) =>
                    loading ? 'Loading document...' : 'Download all tasks in PDF'
                }
            </PDFDownloadLink>

        </div>
    );

};

export default TaskList;
