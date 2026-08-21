import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";

import "./Register.css";

const API_URL =
	import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Register() {
	const navigate = useNavigate();

	const [form, setForm] = useState({
		name: "",
		email: "",
		password: ""
	});

	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (loading) {
			return;
		}

		setError("");
		setLoading(true);

		try {
			const response = await axios.post(
				`${API_URL}/auth/register`,
				form
			);

			const token = response.data?.token;

			if (!token) {
				setError(
					"Account created but no token was received."
				);
				return;
			}

			Cookies.set("token", token, {
				expires: 30,
				path: "/"
			});

			navigate("/tasks", { replace: true });
		} catch (requestError) {
			setError(
				requestError.response?.data?.error ||
					"Unable to create account"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-card">
				<div className="heading">Create account</div>

				<div className="subtitle">
					Keep your interview work organized.
				</div>

				<div className="field-label">Name</div>

				<input
					id="name"
					name="name"
					value={form.name}
					onChange={(event) =>
						setForm({
							...form,
							name: event.target.value
						})
					}
					required
				/>

				<div className="field-label">Email</div>

				<input
					id="email"
					name="email"
					type="email"
					value={form.email}
					onChange={(event) =>
						setForm({
							...form,
							email: event.target.value
						})
					}
					required
				/>

				<div className="field-label">Password</div>

				<input
					id="password"
					name="password"
					type="password"
					minLength={6}
					value={form.password}
					onChange={(event) =>
						setForm({
							...form,
							password: event.target.value
						})
					}
					required
				/>

				{error && <div className="error">{error}</div>}

				<button
					type="button"
					onClick={handleSubmit}
					disabled={loading}
				>
					{loading
						? "Creating..."
						: "Create account"}
				</button>

				<div className="form-link">
					Already registered?{" "}
					<Link to="/login">
						Sign in
					</Link>
				</div>
			</div>
		</div>
	);
}

export default Register;