import {
	BrowserRouter,
	Navigate,
	Route,
	Routes,
	useLocation
} from "react-router-dom";
import Cookies from "js-cookie";

import Login from "./components/Login/Login.jsx";
import Register from "./components/Register/Register.jsx";
import Tasks from "./components/Tasks/Tasks.jsx";

import "./App.css";

function PublicRoute({ children }) {
	useLocation();

	const token = Cookies.get("token");

	if (token) {
		return <Navigate to="/tasks" replace />;
	}

	return children;
}

function ProtectedRoute({ children }) {
	useLocation();

	const token = Cookies.get("token");

	if (!token) {
		return <Navigate to="/login" replace />;
	}

	return children;
}

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/login"
					element={
						<PublicRoute>
							<Login />
						</PublicRoute>
					}
				/>

				<Route
					path="/register"
					element={
						<PublicRoute>
							<Register />
						</PublicRoute>
					}
				/>

				<Route
					path="/tasks"
					element={
						<ProtectedRoute>
							<Tasks />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/"
					element={<Navigate to="/tasks" replace />}
				/>

				<Route
					path="*"
					element={<Navigate to="/tasks" replace />}
				/>
			</Routes>
		</BrowserRouter>
	);
}

export default App;