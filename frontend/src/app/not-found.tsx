import Link from 'next/link';

export default function NoEncontrado() {
  return (
    <main className="min-vh-100 d-flex flex-column align-items-center justify-content-center text-center bg-body-tertiary p-4">
      <p className="display-1 fw-bolder fst-italic text-secondary mb-0">404</p>
      <p className="lead">Esta página no existe.</p>
      <Link href="/" className="btn btn-primary rounded-pill px-4">
        Ir al portal
      </Link>
    </main>
  );
}
