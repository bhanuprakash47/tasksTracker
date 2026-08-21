import "./TaskItem.css";

function TaskItem({ task, onEdit, onDelete }) {
	return (
		<div className="task-item">
			<div className="task-content">
				<div className="task-title-row">
					<div className="task-heading">
						{task.title}
					</div>

					<span
						className={`badge priority-${task.priority.toLowerCase()}`}
					>
						{task.priority}
					</span>
				</div>

				<div className="task-description">
					{task.description}
				</div>

				<div className="task-meta">
					<span>{task.status}</span>

					<span>
						{task.dueDate
							? `Due ${new Date(
									task.dueDate
							  ).toLocaleDateString()}`
							: "No due date"}
					</span>
				</div>
			</div>

			<div className="button-row">
				<button
					type="button"
					className="secondary-button"
					onClick={() => onEdit(task)}
				>
					Edit
				</button>

				<button
					type="button"
					className="danger-button"
					onClick={() => onDelete(task._id)}
				>
					Delete
				</button>
			</div>
		</div>
	);
}

export default TaskItem;