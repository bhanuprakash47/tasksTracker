import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

import TaskItem from "../TaskItem/TaskItem";
import "./Tasks.css";

const API_URL =
	import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const emptyTask = {
	title: "",
	description: "",
	status: "Todo",
	priority: "MEDIUM",
	dueDate: ""
};

const api = axios.create({
	baseURL: API_URL
});

function Tasks() {
	const navigate = useNavigate();

	const redirectingRef = useRef(false);

	const [tasks, setTasks] = useState([]);
	const [form, setForm] = useState(emptyTask);
	const [editingId, setEditingId] = useState(null);

	const [filters, setFilters] = useState({
		status: "",
		priority: "",
		sort: ""
	});

	const [search, setSearch] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

	const getAuthConfig = () => {
		const token = Cookies.get("token");

		if (!token) {
			return null;
		}

		return {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
	};

	const redirectToLogin = () => {
		if (redirectingRef.current) {
			return;
		}

		redirectingRef.current = true;

		Cookies.remove("token", {
			path: "/"
		});

		navigate("/login", {
			replace: true
		});
	};

	const logout = () => {
		redirectToLogin();
	};

	const loadTasks = async () => {
		const config = getAuthConfig();

		if (!config) {
			redirectToLogin();
			return;
		}

		setLoading(true);

		try {
			const response = await api.get("/tasks", {
				...config,
				params: {
					...filters,
					limit: 100
				}
			});

			setTasks(response.data?.tasksList || []);
			setError("");
		} catch (requestError) {
			const status =
				requestError.response?.status;

			if (status === 401) {
				redirectToLogin();
				return;
			}

			if (status === 404) {
				setTasks([]);
				setError("");
				return;
			}

			setError(
				requestError.response?.data?.error ||
					"Unable to load tasks"
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadTasks();
	}, [
		filters.status,
		filters.priority,
		filters.sort
	]);

	const submitTask = async (event) => {
		event.preventDefault();

		if (redirectingRef.current) {
			return;
		}

		setError("");

		const config = getAuthConfig();

		if (!config) {
			redirectToLogin();
			return;
		}

		try {
			let response;

			if (editingId) {
				response = await api.put(
					`/tasks/${editingId}`,
					form,
					config
				);
			} else {
				response = await api.post(
					"/tasks",
					form,
					config
				);
			}

			const savedTask = response.data?.task;

			if (!savedTask) {
				setError("Server did not return the task.");
				return;
			}

			if (editingId) {
				setTasks((currentTasks) =>
					currentTasks.map((task) =>
						task._id === editingId
							? savedTask
							: task
					)
				);
			} else {
				setTasks((currentTasks) => [
					savedTask,
					...currentTasks
				]);
			}

			setForm(emptyTask);
			setEditingId(null);
		} catch (requestError) {
			if (
				requestError.response?.status === 401
			) {
				redirectToLogin();
				return;
			}

			setError(
				requestError.response?.data?.error ||
					"Unable to save task"
			);
		}
	};

	const editTask = (task) => {
		setForm({
			title: task.title || "",
			description: task.description || "",
			status: task.status || "Todo",
			priority: task.priority || "MEDIUM",
			dueDate: task.dueDate
				? task.dueDate.slice(0, 10)
				: ""
		});

		setEditingId(task._id);
		setError("");
	};

	const cancelEdit = () => {
		setEditingId(null);
		setForm(emptyTask);
		setError("");
	};

	const deleteTask = async (id) => {
		if (redirectingRef.current) {
			return;
		}

		setError("");

		const config = getAuthConfig();

		if (!config) {
			redirectToLogin();
			return;
		}

		try {
			await api.delete(`/tasks/${id}`, config);

			setTasks((currentTasks) =>
				currentTasks.filter(
					(task) => task._id !== id
				)
			);
		} catch (requestError) {
			if (
				requestError.response?.status === 401
			) {
				redirectToLogin();
				return;
			}

			setError(
				requestError.response?.data?.error ||
					"Unable to delete task"
			);
		}
	};

	const visibleTasks = tasks.filter((task) =>
		(task.title || "")
			.toLowerCase()
			.includes(search.toLowerCase())
	);

	return (
		<div className="tasks-page">
			<div className="topbar">
				<div>
					<div className="page-heading">
						Task Board
					</div>

					<div className="subtitle">
						Plan, prioritize, and finish your
						interview tasks.
					</div>
				</div>

				<button
					type="button"
					className="secondary-button"
					onClick={logout}
				>
					Log out
				</button>
			</div>

			<div className="workspace">
				<div className="task-form">
					<div className="panel-heading">
						{editingId
							? "Edit task"
							: "Add a task"}
					</div>

					<div className="field-label">
						Title
					</div>

					<input
						id="title"
						name="title"
						value={form.title}
						onChange={(event) =>
							setForm({
								...form,
								title: event.target.value
							})
						}
						required
					/>

					<div className="field-label">
						Description
					</div>

					<textarea
						id="description"
						name="description"
						value={form.description}
						onChange={(event) =>
							setForm({
								...form,
								description:
									event.target.value
							})
						}
						required
					/>

					<div className="form-row">
						<div>
							<div className="field-label">
								Status
							</div>

							<select
								id="status"
								name="status"
								value={form.status}
								onChange={(event) =>
									setForm({
										...form,
										status:
											event.target.value
									})
								}
							>
								<option>Todo</option>
								<option>
									In Progress
								</option>
								<option>Done</option>
							</select>
						</div>

						<div>
							<div className="field-label">
								Priority
							</div>

							<select
								id="priority"
								name="priority"
								value={form.priority}
								onChange={(event) =>
									setForm({
										...form,
										priority:
											event.target.value
									})
								}
							>
								<option>LOW</option>
								<option>MEDIUM</option>
								<option>HIGH</option>
							</select>
						</div>
					</div>

					<div className="field-label">
						Due date
					</div>

					<input
						id="dueDate"
						name="dueDate"
						type="date"
						value={form.dueDate}
						onChange={(event) =>
							setForm({
								...form,
								dueDate:
									event.target.value
							})
						}
					/>

					<div className="button-row">
						<button
							type="button"
							onClick={submitTask}
						>
							{editingId
								? "Update task"
								: "Add task"}
						</button>

						{editingId && (
							<button
								type="button"
								className="secondary-button"
								onClick={cancelEdit}
							>
								Cancel
							</button>
						)}
					</div>
				</div>

				<div className="task-list">
					<div className="list-heading">
						<div>
							<div className="panel-heading">
								Your tasks
							</div>

							<div className="task-count">
								{visibleTasks.length} task
								{visibleTasks.length ===
								1
									? ""
									: "s"}
							</div>
						</div>

						<div className="filters">
							<input
								aria-label="Search tasks"
								placeholder="Search title"
								value={search}
								onChange={(event) =>
									setSearch(
										event.target.value
									)
								}
							/>

							<select
								name="status"
								aria-label="Filter by status"
								value={filters.status}
								onChange={(event) =>
									setFilters({
										...filters,
										status:
											event.target.value
									})
								}
							>
								<option value="">
									All statuses
								</option>
								<option>Todo</option>
								<option>
									In Progress
								</option>
								<option>Done</option>
							</select>

							<select
								name="priority"
								aria-label="Filter by priority"
								value={filters.priority}
								onChange={(event) =>
									setFilters({
										...filters,
										priority:
											event.target.value
									})
								}
							>
								<option value="">
									All priorities
								</option>
								<option>LOW</option>
								<option>MEDIUM</option>
								<option>HIGH</option>
							</select>

							<select
								name="sort"
								aria-label="Sort tasks"
								value={filters.sort}
								onChange={(event) =>
									setFilters({
										...filters,
										sort:
											event.target.value
									})
								}
							>
								<option value="">
									Newest
								</option>
								<option value="dueDate">
									Due soon
								</option>
								<option value="-dueDate">
									Due latest
								</option>
								<option value="priority">
									Priority low to high
								</option>
								<option value="-priority">
									Priority high to low
								</option>
							</select>
						</div>
					</div>

					{error && (
						<div className="error">
							{error}
						</div>
					)}

					{loading ? (
						<div className="empty-state">
							Loading tasks...
						</div>
					) : visibleTasks.length > 0 ? (
						visibleTasks.map(
							(task) => (
								<TaskItem
									key={task._id}
									task={task}
									onEdit={editTask}
									onDelete={
										deleteTask
									}
								/>
							)
						)
					) : (
						<div className="empty-state">
							No tasks match your
							filters.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default Tasks;