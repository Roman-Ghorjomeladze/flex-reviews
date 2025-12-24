import { BrowserRouter, Routes, Route } from "react-router-dom";
import ManagerDashboard from "./pages/ManagerDashboard";
import ReviewDisplayPage from "./pages/ReviewDisplayPage";
import UserReviewPage from "./pages/UserReviewPage";
import "./App.css";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<ManagerDashboard />} />
				<Route path="/property/:propertyId" element={<ReviewDisplayPage />} />
				<Route path="/user/:userId" element={<UserReviewPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
