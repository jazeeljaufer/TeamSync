import { Link } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => (
  <main className="not-found-page">
    <h1 className="not-found-page__title">404</h1>
    <p className="not-found-page__message">The page you are looking for does not exist.</p>
    <Link className="not-found-page__link" to="/dashboard/member">
      Go to Dashboard
    </Link>
  </main>
);

export default NotFound;
