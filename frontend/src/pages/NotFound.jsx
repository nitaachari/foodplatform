import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="font-mono text-sm text-ink/40">404</p>
      <h1 className="mt-2 text-3xl">Page not found</h1>
      <p className="mt-2 text-ink/60">That page doesn't exist, or the order isn't ready to view.</p>
      <Link to="/" className="mt-6 inline-block">
        <Button>Back to restaurants</Button>
      </Link>
    </div>
  );
}
