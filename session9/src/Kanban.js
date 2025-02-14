import React, { useState, useEffect } from "react";
import { getBoards, getColumns, getTasks, createTask, updateTaskColumn } from './api';

const KanbanBoard = () => {
    const [tasks, setTasks] = useState({});
    const [newTask, setNewTask] = useState({ title: "", description: "", column: "backlog" });

    useEffect(() => {
        const fetchData = async () => {
            const boardResponse = await getBoards();
            if (boardResponse.data.length === 0) {
                setTasks({});
                return;
            }

            const boardId = boardResponse.data[0].id; // Assuming there's only one board for simplicity
            const columnsResponse = await getColumns(boardId);
            const columns = columnsResponse.data;

            if (columns.length === 0) {
                setTasks({});
                return;
            }

            const tasksData = {};
            for (const column of columns) {
                const tasksResponse = await getTasks(column.id);
                tasksData[column.name] = tasksResponse.data.map(task => task.title);
            }
            setTasks(tasksData);
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        setNewTask({ ...newTask, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const columnId = Object.keys(tasks).find(key => key === newTask.column);
        await createTask(columnId, { title: newTask.title, description: newTask.description });
        setTasks(prevTasks => ({
            ...prevTasks,
            [newTask.column]: [...prevTasks[newTask.column], newTask.title]
        }));
        setNewTask({ title: "", description: "", column: "backlog" });
    };

    const handleDragStart = (e, task, column) => {
        e.dataTransfer.setData("task", JSON.stringify({ task, column }));
    };

    const handleDrop = async (e, targetColumn) => {
        e.preventDefault();
        const { task, column } = JSON.parse(e.dataTransfer.getData("task"));
        const taskId = tasks[column].find(t => t === task).id; // Assuming task has an id
        await updateTaskColumn(taskId, targetColumn);

        setTasks(prevTasks => {
            const updatedTasks = { ...prevTasks };
            updatedTasks[column] = updatedTasks[column].filter(t => t !== task);
            updatedTasks[targetColumn] = [...updatedTasks[targetColumn], task];
            return updatedTasks;
        });
    };

    const allowDrop = (e) => {
        e.preventDefault();
    };

    return (
        <div>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#007BFF", color: "white", padding: "15px 20px" }}>
                <h1>Kanban Board</h1>
                <button style={{ background: "white", color: "#007BFF", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer" }}>Logout</button>
            </header>

            <div style={{ background: "#fff", padding: "20px", margin: "20px auto", maxWidth: "500px", borderRadius: "5px", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)" }}>
                <h3>Add a New Task</h3>
                <form onSubmit={handleSubmit}>
                    <label>Task Title</label>
                    <input type="text" name="title" value={newTask.title} onChange={handleChange} required />

                    <label>Task Description</label>
                    <textarea name="description" value={newTask.description} onChange={handleChange} required></textarea>

                    <label>Select Column</label>
                    <select name="column" value={newTask.column} onChange={handleChange} required>
                        <option value="backlog">Backlog</option>
                        <option value="todo">To Do</option>
                        <option value="inprogress">In Progress</option>
                        <option value="testing">Testing</option>
                        <option value="done">Done</option>
                    </select>

                    <button type="submit">Add Task</button>
                </form>
            </div>

            <div style={{ display: "flex", gap: "20px", padding: "20px", justifyContent: "center" }}>
                {Object.keys(tasks).length === 0 ? (
                    <p>No boards or columns available.</p>
                ) : (
                    Object.keys(tasks).map(column => (
                        <div
                            key={column}
                            style={{ background: "#fff", border: "1px solid #ddd", borderRadius: "5px", width: "18%", overflow: "hidden" }}
                            onDragOver={allowDrop}
                            onDrop={(e) => handleDrop(e, column)}
                        >
                            <h3 style={{ backgroundColor: "#007BFF", color: "white", padding: "15px", textAlign: "center" }}>{column.replace(/([A-Z])/g, ' $1').toUpperCase()}</h3>
                            <div style={{ padding: "10px" }}>
                                {tasks[column].map((task, index) => (
                                    <div
                                        key={index}
                                        style={{ background: "#f9f9f9", border: "1px solid #ddd", borderRadius: "3px", padding: "10px", marginBottom: "10px", boxShadow: "0 2px 3px rgba(0, 0, 0, 0.1)", cursor: "grab" }}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task, column)}
                                    >
                                        {task}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default KanbanBoard;