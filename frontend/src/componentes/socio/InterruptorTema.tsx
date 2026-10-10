'use client';

import { Form } from 'react-bootstrap';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTema } from '@/contextos/TemaContexto';

export function InterruptorTema({ claro = true }: { claro?: boolean }) {
  const { tema, alternarTema } = useTema();
  const oscuro = tema === 'oscuro';

  return (
    <div className={`d-flex align-items-center gap-2 small ${claro ? 'text-white-50' : 'text-body-secondary'}`}>
      {oscuro ? <FaMoon aria-hidden="true" /> : <FaSun aria-hidden="true" />}
      <Form.Check
        type="switch"
        id="interruptor-tema"
        className="mb-0"
        checked={oscuro}
        onChange={alternarTema}
        label={oscuro ? 'Modo oscuro' : 'Modo claro'}
      />
    </div>
  );
}
