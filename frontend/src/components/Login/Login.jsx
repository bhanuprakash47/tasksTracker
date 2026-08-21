import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";

import "./Login.css";

const API_URL =
	import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Login() {
	const navigate = useNavigate();

	const [form, setForm] = useState({
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
				`${API_URL}/auth/login`,
				form
			);

			const token = response.data?.token;

			if (!token) {
				setError("Login succeeded but no token was received.");
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
					"Unable to log in"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-card">
				<div className="heading">Task Board</div>

				<div className="subtitle">
					Sign in to manage your work.
				</div>

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
					{loading ? "Signing in..." : "Sign in"}
				</button>

				<div className="form-link">
					New here?{" "}
					<Link to="/register">
						Create an account
					</Link>
				</div>
			</div>
		</div>
	);
}

export default Login;