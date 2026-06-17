import React, { useState, useMemo, useCallback } from "react";
import {
  Car,
  Truck,
  Zap,
  Plus,
  Search,
  Calendar,
  User,
  Wrench,
  X,
  Check,
  AlertTriangle,
  ClipboardList,
  Gauge,
  Snowflake,
  Link2,
  DoorOpen,
  Fuel,
  BatteryCharging,
  Weight,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────
   DOMÍNIO — porte 1:1 das regras de negócio do backend Java
   (model.Carro, CarroEletrico, Caminhao, CaminhaoPesado, Cliente, Reserva)
   ──────────────────────────────────────────────────────────────────────── */

let reservaIdSeq = 1;

function calcularCustoDiaria(v) {
  switch (v.tipo) {
    case "CarroEletrico":
      return v.precoDiaria * 1.2;
    case "Carro":
      return v.tipoCombustivel?.toLowerCase() === "flex"
        ? v.precoDiaria * 0.9
        : v.precoDiaria;
    case "CaminhaoPesado": {
      const base = v.precoDiaria + v.capacidadeToneladasCarga * 50.0;
      let total = base;
      if (v.possuiRefrigeracao) total += 200.0;
      total += v.numeroReboques * 150.0;
      return total;
    }
    case "Caminhao":
      return v.precoDiaria + v.capacidadeToneladasCarga * 50.0;
    default:
      return v.precoDiaria;
  }
}

function tipoVeiculoLabel(tipo) {
  return (
    { Carro: "Carro", CarroEletrico: "Carro Elétrico", Caminhao: "Caminhão", CaminhaoPesado: "Caminhão Pesado" }[
      tipo
    ] || tipo
  );
}

const KM_MANUTENCAO = 10000;

function precisaManutencao(v) {
  return v.quilometragem >= KM_MANUTENCAO;
}

function moeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dataBR(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function diasEntre(inicioISO, fimISO) {
  const a = new Date(inicioISO);
  const b = new Date(fimISO);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

/* ────────────────────────────────────────────────────────────────────────
   ESTADO INICIAL — replica o cadastro feito em Main.java
   ──────────────────────────────────────────────────────────────────────── */

const FROTA_INICIAL = [
  {
    placa: "ABC-1234",
    tipo: "Carro",
    marca: "Toyota",
    modelo: "Corolla",
    ano: 2023,
    precoDiaria: 150,
    numeroPortas: 4,
    tipoCombustivel: "Flex",
    disponivel: true,
    quilometragem: 0,
    opcionais: ["Ar-condicionado", "GPS"],
    historicoManutencao: [],
  },
  {
    placa: "DEF-5678",
    tipo: "Carro",
    marca: "Honda",
    modelo: "Civic",
    ano: 2022,
    precoDiaria: 170,
    numeroPortas: 4,
    tipoCombustivel: "Gasolina",
    disponivel: true,
    quilometragem: 0,
    opcionais: [],
    historicoManutencao: [],
  },
  {
    placa: "ELE-0001",
    tipo: "CarroEletrico",
    marca: "Tesla",
    modelo: "Model 3",
    ano: 2024,
    precoDiaria: 250,
    numeroPortas: 4,
    tipoCombustivel: "Elétrico",
    autonomiaKm: 500,
    percentualBateria: 100,
    disponivel: true,
    quilometragem: 0,
    opcionais: ["Piloto automático", "Teto solar", "GPS"],
    historicoManutencao: [],
  },
  {
    placa: "CAM-9999",
    tipo: "Caminhao",
    marca: "Volvo",
    modelo: "FH540",
    ano: 2021,
    precoDiaria: 400,
    capacidadeToneladasCarga: 25,
    numeroEixos: 6,
    disponivel: true,
    quilometragem: 0,
    opcionais: [],
    historicoManutencao: [],
  },
  {
    placa: "CPE-7777",
    tipo: "CaminhaoPesado",
    marca: "Scania",
    modelo: "R450",
    ano: 2020,
    precoDiaria: 500,
    capacidadeToneladasCarga: 40,
    numeroEixos: 8,
    possuiRefrigeracao: true,
    numeroReboques: 2,
    disponivel: true,
    quilometragem: 0,
    opcionais: [],
    historicoManutencao: [],
  },
];

const CLIENTES_INICIAIS = [
  { nome: "Ana Silva", cpf: "111.111.111-11", telefone: "(11) 91111-1111", email: "ana@email.com" },
  { nome: "Bruno Costa", cpf: "222.222.222-22", telefone: "(11) 92222-2222", email: "bruno@email.com" },
];

/* ────────────────────────────────────────────────────────────────────────
   TOASTS
   ──────────────────────────────────────────────────────────────────────── */

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((tipo, mensagem) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, tipo, mensagem }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  return { toasts, push, dismiss };
}

function ToastStack({ toasts, dismiss }) {
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.tipo}`} role="status">
          {t.tipo === "erro" ? <AlertTriangle size={16} /> : <Check size={16} />}
          <span>{t.mensagem}</span>
          <button aria-label="Fechar aviso" onClick={() => dismiss(t.id)}>
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   ÍCONES / VISUAL POR TIPO DE VEÍCULO
   ──────────────────────────────────────────────────────────────────────── */

function IconeTipo({ tipo, size = 18 }) {
  if (tipo === "CarroEletrico") return <Zap size={size} />;
  if (tipo === "Caminhao" || tipo === "CaminhaoPesado") return <Truck size={size} />;
  return <Car size={size} />;
}

/* ────────────────────────────────────────────────────────────────────────
   PLACA DE VEÍCULO — elemento de assinatura visual
   ──────────────────────────────────────────────────────────────────────── */

function PlacaVeiculo({ veiculo }) {
  return (
    <div className={`placa placa--${veiculo.disponivel ? "ok" : "off"}`}>
      <span className="placa__pais">BR</span>
      <span className="placa__codigo">{veiculo.placa}</span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   CARTÃO DE VEÍCULO
   ──────────────────────────────────────────────────────────────────────── */

function CartaoVeiculo({ veiculo, onReservar, onManutencao, onFinalizarManutencao, onRecarregar }) {
  const custo = calcularCustoDiaria(veiculo);
  const precisa = precisaManutencao(veiculo);

  return (
    <article className="card-veiculo">
      <div className="card-veiculo__topo">
        <div className="card-veiculo__tag">
          <IconeTipo tipo={veiculo.tipo} size={15} />
          <span>{tipoVeiculoLabel(veiculo.tipo)}</span>
        </div>
        <span className={`pill pill--${veiculo.disponivel ? "verde" : "vermelho"}`}>
          {veiculo.disponivel ? "Disponível" : "Indisponível"}
        </span>
      </div>

      <h3 className="card-veiculo__nome">
        {veiculo.marca} <em>{veiculo.modelo}</em>
      </h3>
      <span className="card-veiculo__ano">{veiculo.ano}</span>

      <PlacaVeiculo veiculo={veiculo} />

      <dl className="specs">
        {veiculo.tipo === "Carro" && (
          <>
            <Spec icon={<DoorOpen size={14} />} label="Portas" value={veiculo.numeroPortas} />
            <Spec icon={<Fuel size={14} />} label="Combustível" value={veiculo.tipoCombustivel} />
          </>
        )}
        {veiculo.tipo === "CarroEletrico" && (
          <>
            <Spec icon={<DoorOpen size={14} />} label="Portas" value={veiculo.numeroPortas} />
            <Spec icon={<BatteryCharging size={14} />} label="Autonomia" value={`${veiculo.autonomiaKm} km`} />
            <Spec icon={<BatteryCharging size={14} />} label="Bateria" value={`${veiculo.percentualBateria}%`} />
          </>
        )}
        {(veiculo.tipo === "Caminhao" || veiculo.tipo === "CaminhaoPesado") && (
          <>
            <Spec icon={<Weight size={14} />} label="Carga" value={`${veiculo.capacidadeToneladasCarga} t`} />
            <Spec icon={<Gauge size={14} />} label="Eixos" value={veiculo.numeroEixos} />
          </>
        )}
        {veiculo.tipo === "CaminhaoPesado" && (
          <>
            <Spec icon={<Snowflake size={14} />} label="Refrigeração" value={veiculo.possuiRefrigeracao ? "Sim" : "Não"} />
            <Spec icon={<Link2 size={14} />} label="Reboques" value={veiculo.numeroReboques} />
          </>
        )}
      </dl>

      {veiculo.opcionais.length > 0 && (
        <div className="opcionais">
          {veiculo.opcionais.map((o) => (
            <span key={o} className="opcionais__item">
              {o}
            </span>
          ))}
        </div>
      )}

      {precisa && (
        <div className="aviso-manutencao">
          <AlertTriangle size={13} />
          <span>{veiculo.quilometragem.toLocaleString("pt-BR")} km rodados — manutenção recomendada</span>
        </div>
      )}

      <div className="card-veiculo__rodape">
        <div className="diaria">
          <span className="diaria__valor">{moeda(custo)}</span>
          <span className="diaria__label">por dia</span>
        </div>
        <div className="card-veiculo__acoes">
          {veiculo.tipo === "CarroEletrico" && (
            <button className="btn-icon" title="Recarregar bateria" onClick={() => onRecarregar(veiculo.placa)}>
              <BatteryCharging size={15} />
            </button>
          )}
          {veiculo.disponivel ? (
            <>
              <button className="btn-icon" title="Enviar para manutenção" onClick={() => onManutencao(veiculo)}>
                <Wrench size={15} />
              </button>
              <button className="btn-primario" onClick={() => onReservar(veiculo)}>
                Reservar
              </button>
            </>
          ) : (
            <button className="btn-secundario" onClick={() => onFinalizarManutencao(veiculo.placa)}>
              Liberar veículo
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function Spec({ icon, label, value }) {
  return (
    <div className="spec">
      <dt>
        {icon}
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   MODAL GENÉRICO
   ──────────────────────────────────────────────────────────────────────── */

function Modal({ titulo, onClose, children, icon }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="modal__topo">
          <h3>
            {icon}
            {titulo}
          </h3>
          <button aria-label="Fechar" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal__corpo">{children}</div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   FORM: CADASTRAR VEÍCULO
   ──────────────────────────────────────────────────────────────────────── */

function FormVeiculo({ onSalvar, onCancelar, placasExistentes }) {
  const [tipo, setTipo] = useState("Carro");
  const [campos, setCampos] = useState({
    placa: "",
    marca: "",
    modelo: "",
    ano: new Date().getFullYear(),
    precoDiaria: "",
    numeroPortas: 4,
    tipoCombustivel: "Flex",
    autonomiaKm: "",
    capacidadeToneladasCarga: "",
    numeroEixos: "",
    possuiRefrigeracao: false,
    numeroReboques: 0,
  });
  const [erro, setErro] = useState("");

  function set(campo, valor) {
    setCampos((c) => ({ ...c, [campo]: valor }));
  }

  function validarPlaca(p) {
    return /^[A-Za-z]{3}-?\d{4}$/.test(p.trim());
  }

  function submeter(e) {
    e.preventDefault();
    const placa = campos.placa.trim().toUpperCase();
    if (!placa || !campos.marca.trim() || !campos.modelo.trim() || !campos.precoDiaria) {
      setErro("Preencha placa, marca, modelo e valor da diária.");
      return;
    }
    if (!validarPlaca(placa)) {
      setErro("Use o formato de placa AAA-1234.");
      return;
    }
    if (placasExistentes.includes(placa)) {
      setErro(`Já existe um veículo cadastrado com a placa ${placa}.`);
      return;
    }
    const precoDiaria = parseFloat(campos.precoDiaria);
    if (isNaN(precoDiaria) || precoDiaria <= 0) {
      setErro("Informe um valor de diária válido.");
      return;
    }

    const base = {
      placa,
      tipo,
      marca: campos.marca.trim(),
      modelo: campos.modelo.trim(),
      ano: parseInt(campos.ano, 10),
      precoDiaria,
      disponivel: true,
      quilometragem: 0,
      opcionais: [],
      historicoManutencao: [],
    };

    if (tipo === "Carro" || tipo === "CarroEletrico") {
      base.numeroPortas = parseInt(campos.numeroPortas, 10) || 4;
    }
    if (tipo === "Carro") {
      base.tipoCombustivel = campos.tipoCombustivel;
    }
    if (tipo === "CarroEletrico") {
      base.tipoCombustivel = "Elétrico";
      base.autonomiaKm = parseInt(campos.autonomiaKm, 10) || 0;
      base.percentualBateria = 100;
    }
    if (tipo === "Caminhao" || tipo === "CaminhaoPesado") {
      const cap = parseFloat(campos.capacidadeToneladasCarga);
      if (isNaN(cap) || cap <= 0) {
        setErro("Informe a capacidade de carga em toneladas.");
        return;
      }
      base.capacidadeToneladasCarga = cap;
      base.numeroEixos = parseInt(campos.numeroEixos, 10) || 2;
    }
    if (tipo === "CaminhaoPesado") {
      base.possuiRefrigeracao = campos.possuiRefrigeracao;
      base.numeroReboques = parseInt(campos.numeroReboques, 10) || 0;
    }

    onSalvar(base);
  }

  return (
    <form className="formulario" onSubmit={submeter}>
      <label className="campo">
        <span>Tipo de veículo</span>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="Carro">Carro</option>
          <option value="CarroEletrico">Carro Elétrico</option>
          <option value="Caminhao">Caminhão</option>
          <option value="CaminhaoPesado">Caminhão Pesado</option>
        </select>
      </label>

      <div className="campo-grid">
        <label className="campo">
          <span>Placa</span>
          <input
            placeholder="AAA-1234"
            value={campos.placa}
            onChange={(e) => set("placa", e.target.value)}
            maxLength={8}
          />
        </label>
        <label className="campo">
          <span>Ano</span>
          <input
            type="number"
            value={campos.ano}
            min={1980}
            max={2030}
            onChange={(e) => set("ano", e.target.value)}
          />
        </label>
      </div>

      <div className="campo-grid">
        <label className="campo">
          <span>Marca</span>
          <input value={campos.marca} onChange={(e) => set("marca", e.target.value)} placeholder="Ex.: Toyota" />
        </label>
        <label className="campo">
          <span>Modelo</span>
          <input value={campos.modelo} onChange={(e) => set("modelo", e.target.value)} placeholder="Ex.: Corolla" />
        </label>
      </div>

      <label className="campo">
        <span>Diária base (R$)</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={campos.precoDiaria}
          onChange={(e) => set("precoDiaria", e.target.value)}
          placeholder="0,00"
        />
      </label>

      {(tipo === "Carro" || tipo === "CarroEletrico") && (
        <div className="campo-grid">
          <label className="campo">
            <span>Número de portas</span>
            <input
              type="number"
              min={2}
              max={5}
              value={campos.numeroPortas}
              onChange={(e) => set("numeroPortas", e.target.value)}
            />
          </label>
          {tipo === "Carro" ? (
            <label className="campo">
              <span>Combustível</span>
              <select value={campos.tipoCombustivel} onChange={(e) => set("tipoCombustivel", e.target.value)}>
                <option value="Flex">Flex</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Diesel">Diesel</option>
              </select>
            </label>
          ) : (
            <label className="campo">
              <span>Autonomia (km)</span>
              <input
                type="number"
                min={0}
                value={campos.autonomiaKm}
                onChange={(e) => set("autonomiaKm", e.target.value)}
              />
            </label>
          )}
        </div>
      )}

      {(tipo === "Caminhao" || tipo === "CaminhaoPesado") && (
        <div className="campo-grid">
          <label className="campo">
            <span>Capacidade de carga (t)</span>
            <input
              type="number"
              min={0}
              step="0.5"
              value={campos.capacidadeToneladasCarga}
              onChange={(e) => set("capacidadeToneladasCarga", e.target.value)}
            />
          </label>
          <label className="campo">
            <span>Número de eixos</span>
            <input
              type="number"
              min={2}
              value={campos.numeroEixos}
              onChange={(e) => set("numeroEixos", e.target.value)}
            />
          </label>
        </div>
      )}

      {tipo === "CaminhaoPesado" && (
        <div className="campo-grid">
          <label className="campo campo--checkbox">
            <input
              type="checkbox"
              checked={campos.possuiRefrigeracao}
              onChange={(e) => set("possuiRefrigeracao", e.target.checked)}
            />
            <span>Possui refrigeração</span>
          </label>
          <label className="campo">
            <span>Número de reboques</span>
            <input
              type="number"
              min={0}
              value={campos.numeroReboques}
              onChange={(e) => set("numeroReboques", e.target.value)}
            />
          </label>
        </div>
      )}

      {erro && (
        <p className="erro-form">
          <AlertTriangle size={14} /> {erro}
        </p>
      )}

      <div className="formulario__acoes">
        <button type="button" className="btn-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn-primario">
          Cadastrar veículo
        </button>
      </div>
    </form>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   FORM: CADASTRAR CLIENTE
   ──────────────────────────────────────────────────────────────────────── */

function FormCliente({ onSalvar, onCancelar, cpfsExistentes }) {
  const [campos, setCampos] = useState({ nome: "", cpf: "", telefone: "", email: "" });
  const [erro, setErro] = useState("");

  function set(campo, valor) {
    setCampos((c) => ({ ...c, [campo]: valor }));
  }

  function validarCpf(cpf) {
    return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf.trim());
  }

  function submeter(e) {
    e.preventDefault();
    const cpf = campos.cpf.trim();
    if (!campos.nome.trim() || !cpf) {
      setErro("Preencha nome e CPF.");
      return;
    }
    if (!validarCpf(cpf)) {
      setErro("Use o formato de CPF 000.000.000-00.");
      return;
    }
    if (cpfsExistentes.includes(cpf)) {
      setErro("Já existe um cliente cadastrado com esse CPF.");
      return;
    }
    onSalvar({ nome: campos.nome.trim(), cpf, telefone: campos.telefone.trim(), email: campos.email.trim() });
  }

  return (
    <form className="formulario" onSubmit={submeter}>
      <label className="campo">
        <span>Nome completo</span>
        <input value={campos.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Ex.: Ana Silva" />
      </label>
      <label className="campo">
        <span>CPF</span>
        <input value={campos.cpf} onChange={(e) => set("cpf", e.target.value)} placeholder="000.000.000-00" />
      </label>
      <div className="campo-grid">
        <label className="campo">
          <span>Telefone</span>
          <input
            value={campos.telefone}
            onChange={(e) => set("telefone", e.target.value)}
            placeholder="(11) 90000-0000"
          />
        </label>
        <label className="campo">
          <span>E-mail</span>
          <input
            type="email"
            value={campos.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="nome@email.com"
          />
        </label>
      </div>

      {erro && (
        <p className="erro-form">
          <AlertTriangle size={14} /> {erro}
        </p>
      )}

      <div className="formulario__acoes">
        <button type="button" className="btn-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn-primario">
          Cadastrar cliente
        </button>
      </div>
    </form>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   FORM: RESERVA
   ──────────────────────────────────────────────────────────────────────── */

function FormReserva({ veiculo, clientes, onConfirmar, onCancelar }) {
  const hoje = new Date().toISOString().slice(0, 10);
  const amanha = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10);
  const [cpf, setCpf] = useState(clientes[0]?.cpf ?? "");
  const [dataInicio, setDataInicio] = useState(hoje);
  const [dataFim, setDataFim] = useState(amanha);
  const [erro, setErro] = useState("");

  const dias = Math.max(0, diasEntre(dataInicio, dataFim));
  const custoDiaria = calcularCustoDiaria(veiculo);
  const total = dias * custoDiaria;

  function submeter(e) {
    e.preventDefault();
    if (!cpf) {
      setErro("Selecione um cliente.");
      return;
    }
    if (dias <= 0) {
      setErro("A data final deve ser depois da data de início.");
      return;
    }
    onConfirmar({ cpf, dataInicio, dataFim });
  }

  return (
    <form className="formulario" onSubmit={submeter}>
      <div className="resumo-veiculo">
        <IconeTipo tipo={veiculo.tipo} size={20} />
        <div>
          <strong>
            {veiculo.marca} {veiculo.modelo}
          </strong>
          <span>{veiculo.placa}</span>
        </div>
        <span className="resumo-veiculo__diaria">{moeda(custoDiaria)}/dia</span>
      </div>

      <label className="campo">
        <span>Cliente</span>
        <select value={cpf} onChange={(e) => setCpf(e.target.value)}>
          {clientes.length === 0 && <option value="">Nenhum cliente cadastrado</option>}
          {clientes.map((c) => (
            <option key={c.cpf} value={c.cpf}>
              {c.nome} — {c.cpf}
            </option>
          ))}
        </select>
      </label>

      <div className="campo-grid">
        <label className="campo">
          <span>Data de início</span>
          <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </label>
        <label className="campo">
          <span>Data de devolução</span>
          <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </label>
      </div>

      <div className="total-reserva">
        <span>
          {dias} {dias === 1 ? "diária" : "diárias"} × {moeda(custoDiaria)}
        </span>
        <strong>{moeda(total)}</strong>
      </div>

      {erro && (
        <p className="erro-form">
          <AlertTriangle size={14} /> {erro}
        </p>
      )}

      <div className="formulario__acoes">
        <button type="button" className="btn-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn-primario" disabled={clientes.length === 0}>
          Confirmar reserva
        </button>
      </div>
    </form>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   FORM: MANUTENÇÃO
   ──────────────────────────────────────────────────────────────────────── */

function FormManutencao({ veiculo, onConfirmar, onCancelar }) {
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState("");

  function submeter(e) {
    e.preventDefault();
    if (!descricao.trim()) {
      setErro("Descreva o serviço de manutenção.");
      return;
    }
    onConfirmar(descricao.trim());
  }

  return (
    <form className="formulario" onSubmit={submeter}>
      <p className="texto-modal">
        O veículo <strong>{veiculo.placa}</strong> ficará indisponível para reservas até a manutenção ser finalizada.
      </p>
      <label className="campo">
        <span>Descrição do serviço</span>
        <textarea
          rows={3}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex.: Troca de óleo e revisão dos freios"
        />
      </label>
      {erro && (
        <p className="erro-form">
          <AlertTriangle size={14} /> {erro}
        </p>
      )}
      <div className="formulario__acoes">
        <button type="button" className="btn-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn-primario">
          Enviar para manutenção
        </button>
      </div>
    </form>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   TABELA DE RESERVAS
   ──────────────────────────────────────────────────────────────────────── */

function TabelaReservas({ reservas, onCancelar }) {
  if (reservas.length === 0) {
    return (
      <div className="vazio">
        <ClipboardList size={26} />
        <p>Nenhuma reserva registrada ainda. Reserve um veículo na aba Frota.</p>
      </div>
    );
  }
  return (
    <div className="tabela-wrap">
      <table className="tabela">
        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>Veículo</th>
            <th>Período</th>
            <th>Total</th>
            <th>Status</th>
            <th aria-label="Ações"></th>
          </tr>
        </thead>
        <tbody>
          {reservas
            .slice()
            .reverse()
            .map((r) => (
              <tr key={r.id} className={!r.ativa ? "tabela__linha--cancelada" : ""}>
                <td className="mono">#{r.id}</td>
                <td>{r.clienteNome}</td>
                <td className="mono">{r.placaVeiculo}</td>
                <td>
                  {dataBR(r.dataInicio)} → {dataBR(r.dataFim)}
                </td>
                <td className="mono">{moeda(r.valorTotal)}</td>
                <td>
                  <span className={`pill pill--${r.ativa ? "verde" : "cinza"}`}>
                    {r.ativa ? "Ativa" : "Cancelada"}
                  </span>
                </td>
                <td>
                  {r.ativa && (
                    <button className="link-acao" onClick={() => onCancelar(r.id)}>
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   LISTA DE CLIENTES
   ──────────────────────────────────────────────────────────────────────── */

function ListaClientes({ clientes, reservas }) {
  if (clientes.length === 0) {
    return (
      <div className="vazio">
        <User size={26} />
        <p>Nenhum cliente cadastrado ainda.</p>
      </div>
    );
  }
  return (
    <div className="grade-clientes">
      {clientes.map((c) => {
        const historico = reservas.filter((r) => r.cpfCliente === c.cpf);
        return (
          <div key={c.cpf} className="card-cliente">
            <div className="card-cliente__avatar">{c.nome.charAt(0).toUpperCase()}</div>
            <div className="card-cliente__info">
              <strong>{c.nome}</strong>
              <span className="mono">{c.cpf}</span>
              <span>{c.telefone || "Sem telefone"}</span>
              <span>{c.email || "Sem e-mail"}</span>
            </div>
            <div className="card-cliente__contagem">
              <span>{historico.length}</span>
              <small>{historico.length === 1 ? "reserva" : "reservas"}</small>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   RELATÓRIO
   ──────────────────────────────────────────────────────────────────────── */

function Relatorio({ frota, clientes, reservas }) {
  const disponiveis = frota.filter((v) => v.disponivel).length;
  const ativas = reservas.filter((r) => r.ativa).length;
  const cpfsUnicos = new Set(reservas.map((r) => r.cpfCliente)).size;
  const receitaAtiva = reservas.filter((r) => r.ativa).reduce((acc, r) => acc + r.valorTotal, 0);
  const porTipo = frota.reduce((acc, v) => {
    acc[v.tipo] = (acc[v.tipo] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="relatorio">
      <div className="relatorio__grade">
        <Metrica label="Veículos na frota" valor={frota.length} />
        <Metrica label="Disponíveis agora" valor={disponiveis} />
        <Metrica label="Reservas ativas" valor={ativas} />
        <Metrica label="Clientes com reserva" valor={cpfsUnicos} />
        <Metrica label="Receita em reservas ativas" valor={moeda(receitaAtiva)} destaque />
      </div>

      <div className="relatorio__bloco">
        <h4>Composição da frota</h4>
        <div className="barra-composicao">
          {Object.entries(porTipo).map(([tipo, qtd]) => (
            <div key={tipo} className="barra-composicao__item">
              <IconeTipo tipo={tipo} size={14} />
              <span>{tipoVeiculoLabel(tipo)}</span>
              <strong>{qtd}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="relatorio__bloco">
        <h4>Frota completa</h4>
        <div className="tabela-wrap">
          <table className="tabela">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Veículo</th>
                <th>Tipo</th>
                <th>Diária</th>
                <th>KM</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {frota.map((v) => (
                <tr key={v.placa}>
                  <td className="mono">{v.placa}</td>
                  <td>
                    {v.marca} {v.modelo}
                  </td>
                  <td>{tipoVeiculoLabel(v.tipo)}</td>
                  <td className="mono">{moeda(calcularCustoDiaria(v))}</td>
                  <td className="mono">{v.quilometragem.toLocaleString("pt-BR")}</td>
                  <td>
                    <span className={`pill pill--${v.disponivel ? "verde" : "vermelho"}`}>
                      {v.disponivel ? "Disponível" : "Indisponível"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Metrica({ label, valor, destaque }) {
  return (
    <div className={`metrica ${destaque ? "metrica--destaque" : ""}`}>
      <span className="metrica__valor">{valor}</span>
      <span className="metrica__label">{label}</span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   APP PRINCIPAL
   ──────────────────────────────────────────────────────────────────────── */

const ABAS = [
  { id: "frota", label: "Frota", icon: Car },
  { id: "clientes", label: "Clientes", icon: User },
  { id: "reservas", label: "Reservas", icon: Calendar },
  { id: "relatorio", label: "Relatório", icon: ClipboardList },
];

export default function App() {
  const [frota, setFrota] = useState(FROTA_INICIAL);
  const [clientes, setClientes] = useState(CLIENTES_INICIAIS);
  const [reservas, setReservas] = useState([]);
  const [aba, setAba] = useState("frota");
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState("todos");

  const [modal, setModal] = useState(null); // { tipo: 'veiculo'|'cliente'|'reserva'|'manutencao', veiculo? }

  const { toasts, push, dismiss } = useToasts();

  const frotaFiltrada = useMemo(() => {
    return frota.filter((v) => {
      if (filtroTipo !== "todos" && v.tipo !== filtroTipo) return false;
      if (filtroDisponibilidade === "disponivel" && !v.disponivel) return false;
      if (filtroDisponibilidade === "indisponivel" && v.disponivel) return false;
      if (busca.trim()) {
        const alvo = `${v.marca} ${v.modelo} ${v.placa}`.toLowerCase();
        if (!alvo.includes(busca.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [frota, filtroTipo, filtroDisponibilidade, busca]);

  /* ---- ações: veículo ---- */

  function cadastrarVeiculo(novo) {
    setFrota((f) => [...f, novo]);
    push("sucesso", `Veículo cadastrado: ${novo.placa}`);
    setModal(null);
  }

  function abrirManutencao(veiculo) {
    setModal({ tipo: "manutencao", veiculo });
  }

  function enviarParaManutencao(descricao) {
    const veiculo = modal.veiculo;
    setFrota((f) =>
      f.map((v) =>
        v.placa === veiculo.placa
          ? {
              ...v,
              disponivel: false,
              historicoManutencao: [...v.historicoManutencao, `[${new Date().toLocaleDateString("pt-BR")}] ${descricao}`],
            }
          : v
      )
    );
    push("sucesso", `Veículo ${veiculo.placa} enviado para manutenção.`);
    setModal(null);
  }

  function finalizarManutencao(placa) {
    setFrota((f) => f.map((v) => (v.placa === placa ? { ...v, disponivel: true } : v)));
    push("sucesso", `Manutenção finalizada para o veículo ${placa}.`);
  }

  function recarregar(placa) {
    setFrota((f) => f.map((v) => (v.placa === placa ? { ...v, percentualBateria: 100 } : v)));
    push("sucesso", `Bateria do veículo ${placa} recarregada a 100%.`);
  }

  /* ---- ações: cliente ---- */

  function cadastrarCliente(novo) {
    setClientes((c) => [...c, novo]);
    push("sucesso", `Cliente cadastrado: ${novo.nome}`);
    setModal(null);
  }

  /* ---- ações: reserva ---- */

  function abrirReserva(veiculo) {
    if (clientes.length === 0) {
      push("erro", "Cadastre um cliente antes de reservar um veículo.");
      return;
    }
    setModal({ tipo: "reserva", veiculo });
  }

  function confirmarReserva({ cpf, dataInicio, dataFim }) {
    const veiculo = modal.veiculo;
    const veiculoAtual = frota.find((v) => v.placa === veiculo.placa);

    if (!veiculoAtual || !veiculoAtual.disponivel) {
      push("erro", `Veículo ${veiculo.placa} não está disponível para reserva.`);
      setModal(null);
      return;
    }
    const cliente = clientes.find((c) => c.cpf === cpf);
    if (!cliente) {
      push("erro", `Cliente com CPF ${cpf} não encontrado.`);
      setModal(null);
      return;
    }

    const dias = diasEntre(dataInicio, dataFim);
    const valorTotal = dias * calcularCustoDiaria(veiculoAtual);

    const reserva = {
      id: reservaIdSeq++,
      clienteNome: cliente.nome,
      cpfCliente: cliente.cpf,
      placaVeiculo: veiculoAtual.placa,
      dataInicio,
      dataFim,
      ativa: true,
      valorTotal,
    };

    setReservas((r) => [...r, reserva]);
    setFrota((f) => f.map((v) => (v.placa === veiculoAtual.placa ? { ...v, disponivel: false } : v)));
    push("sucesso", `Reserva #${reserva.id} confirmada para ${cliente.nome}.`);
    setModal(null);
  }

  function cancelarReserva(id) {
    const reserva = reservas.find((r) => r.id === id);
    if (!reserva) {
      push("erro", `Reserva #${id} não encontrada no sistema.`);
      return;
    }
    setReservas((rs) => rs.map((r) => (r.id === id ? { ...r, ativa: false } : r)));
    setFrota((f) => f.map((v) => (v.placa === reserva.placaVeiculo ? { ...v, disponivel: true } : v)));
    push("sucesso", `Reserva #${id} cancelada.`);
  }

  const placasExistentes = frota.map((v) => v.placa);
  const cpfsExistentes = clientes.map((c) => c.cpf);

  return (
    <div className="app">
      <style>{ESTILOS}</style>

      <header className="topo">
        <div className="topo__marca">
          <span className="topo__selo">
            <Car size={20} strokeWidth={2.2} />
          </span>
          <div>
            <h1>Drive Car</h1>
            <span>Sistema de locação de frota</span>
          </div>
        </div>

        <nav className="topo__abas" role="tablist">
          {ABAS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={aba === id}
              className={`aba ${aba === id ? "aba--ativa" : ""}`}
              onClick={() => setAba(id)}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="conteudo">
        {aba === "frota" && (
          <section>
            <div className="barra-controles">
              <div className="busca">
                <Search size={15} />
                <input
                  placeholder="Buscar por placa, marca ou modelo…"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>

              <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="select-filtro">
                <option value="todos">Todos os tipos</option>
                <option value="Carro">Carro</option>
                <option value="CarroEletrico">Carro Elétrico</option>
                <option value="Caminhao">Caminhão</option>
                <option value="CaminhaoPesado">Caminhão Pesado</option>
              </select>

              <select
                value={filtroDisponibilidade}
                onChange={(e) => setFiltroDisponibilidade(e.target.value)}
                className="select-filtro"
              >
                <option value="todos">Todos os status</option>
                <option value="disponivel">Disponíveis</option>
                <option value="indisponivel">Indisponíveis</option>
              </select>

              <button className="btn-primario btn-primario--icone" onClick={() => setModal({ tipo: "veiculo" })}>
                <Plus size={15} />
                Novo veículo
              </button>
            </div>

            {frotaFiltrada.length === 0 ? (
              <div className="vazio">
                <Car size={26} />
                <p>Nenhum veículo encontrado com esses filtros.</p>
              </div>
            ) : (
              <div className="grade-veiculos">
                {frotaFiltrada.map((v) => (
                  <CartaoVeiculo
                    key={v.placa}
                    veiculo={v}
                    onReservar={abrirReserva}
                    onManutencao={abrirManutencao}
                    onFinalizarManutencao={finalizarManutencao}
                    onRecarregar={recarregar}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {aba === "clientes" && (
          <section>
            <div className="barra-controles barra-controles--simples">
              <h2>Clientes cadastrados</h2>
              <button className="btn-primario btn-primario--icone" onClick={() => setModal({ tipo: "cliente" })}>
                <Plus size={15} />
                Novo cliente
              </button>
            </div>
            <ListaClientes clientes={clientes} reservas={reservas} />
          </section>
        )}

        {aba === "reservas" && (
          <section>
            <div className="barra-controles barra-controles--simples">
              <h2>Reservas</h2>
            </div>
            <TabelaReservas reservas={reservas} onCancelar={cancelarReserva} />
          </section>
        )}

        {aba === "relatorio" && (
          <section>
            <div className="barra-controles barra-controles--simples">
              <h2>Relatório da locadora</h2>
            </div>
            <Relatorio frota={frota} clientes={clientes} reservas={reservas} />
          </section>
        )}
      </main>

      {modal?.tipo === "veiculo" && (
        <Modal titulo="Cadastrar veículo" icon={<Car size={17} />} onClose={() => setModal(null)}>
          <FormVeiculo onSalvar={cadastrarVeiculo} onCancelar={() => setModal(null)} placasExistentes={placasExistentes} />
        </Modal>
      )}

      {modal?.tipo === "cliente" && (
        <Modal titulo="Cadastrar cliente" icon={<User size={17} />} onClose={() => setModal(null)}>
          <FormCliente onSalvar={cadastrarCliente} onCancelar={() => setModal(null)} cpfsExistentes={cpfsExistentes} />
        </Modal>
      )}

      {modal?.tipo === "reserva" && (
        <Modal titulo="Nova reserva" icon={<Calendar size={17} />} onClose={() => setModal(null)}>
          <FormReserva
            veiculo={modal.veiculo}
            clientes={clientes}
            onConfirmar={confirmarReserva}
            onCancelar={() => setModal(null)}
          />
        </Modal>
      )}

      {modal?.tipo === "manutencao" && (
        <Modal titulo="Enviar para manutenção" icon={<Wrench size={17} />} onClose={() => setModal(null)}>
          <FormManutencao veiculo={modal.veiculo} onConfirmar={enviarParaManutencao} onCancelar={() => setModal(null)} />
        </Modal>
      )}

      <ToastStack toasts={toasts} dismiss={dismiss} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   ESTILOS
   ──────────────────────────────────────────────────────────────────────── */

const ESTILOS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --asfalto: #14171C;
  --asfalto-alt: #1B1F26;
  --papel: #ECE9E1;
  --papel-fraco: #B7B2A6;
  --sinal: #F5B700;
  --sinal-escuro: #C99200;
  --verde: #3E7C59;
  --verde-fraco: #2A3B30;
  --vermelho: #A23B3B;
  --vermelho-fraco: #3B2723;
  --linha: rgba(236, 233, 225, 0.12);
}

* { box-sizing: border-box; }

.app {
  min-height: 100vh;
  background: var(--asfalto);
  background-image:
    radial-gradient(circle at 15% 0%, rgba(245,183,0,0.07), transparent 45%),
    repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px);
  color: var(--papel);
  font-family: 'Inter', sans-serif;
  padding-bottom: 4rem;
}

.mono { font-family: 'JetBrains Mono', monospace; }

/* ---- topo ---- */

.topo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--linha);
  background: linear-gradient(180deg, var(--asfalto-alt), var(--asfalto));
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(6px);
}

.topo__marca { display: flex; align-items: center; gap: 0.75rem; }

.topo__selo {
  width: 42px; height: 42px;
  border-radius: 10px;
  background: var(--sinal);
  color: var(--asfalto);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.topo__marca h1 {
  font-family: 'Oswald', sans-serif;
  font-weight: 600;
  font-size: 1.4rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 0;
  line-height: 1.1;
}

.topo__marca span {
  font-size: 0.78rem;
  color: var(--papel-fraco);
}

.topo__abas {
  display: flex;
  gap: 0.4rem;
  background: rgba(0,0,0,0.25);
  padding: 0.3rem;
  border-radius: 10px;
  border: 1px solid var(--linha);
}

.aba {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  border: none;
  background: transparent;
  color: var(--papel-fraco);
  font-family: 'Inter', sans-serif;
  font-size: 0.84rem;
  font-weight: 500;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.aba:hover { color: var(--papel); }

.aba--ativa {
  background: var(--sinal);
  color: var(--asfalto);
}

/* ---- conteúdo ---- */

.conteudo {
  max-width: 1240px;
  margin: 0 auto;
  padding: 2rem;
}

.barra-controles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.barra-controles--simples { justify-content: space-between; }

.barra-controles--simples h2 {
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
  color: var(--papel-fraco);
}

.busca {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--asfalto-alt);
  border: 1px solid var(--linha);
  border-radius: 8px;
  padding: 0.55rem 0.8rem;
  flex: 1;
  min-width: 220px;
  color: var(--papel-fraco);
}

.busca input {
  background: none;
  border: none;
  color: var(--papel);
  font-size: 0.88rem;
  width: 100%;
  outline: none;
}

.select-filtro {
  background: var(--asfalto-alt);
  border: 1px solid var(--linha);
  color: var(--papel);
  border-radius: 8px;
  padding: 0.55rem 0.7rem;
  font-size: 0.85rem;
  font-family: 'Inter', sans-serif;
}

.btn-primario, .btn-secundario, .btn-icon {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  transition: transform 0.1s, filter 0.15s, background 0.15s;
}

.btn-primario {
  background: var(--sinal);
  color: var(--asfalto);
  padding: 0.6rem 1.1rem;
}
.btn-primario:hover { filter: brightness(1.08); }
.btn-primario:active { transform: scale(0.98); }
.btn-primario:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-primario--icone { display: inline-flex; align-items: center; gap: 0.4rem; white-space: nowrap; }

.btn-secundario {
  background: transparent;
  border: 1px solid var(--linha);
  color: var(--papel);
  padding: 0.6rem 1.1rem;
}
.btn-secundario:hover { background: rgba(255,255,255,0.05); }

.btn-icon {
  background: var(--asfalto-alt);
  border: 1px solid var(--linha);
  color: var(--papel);
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
}
.btn-icon:hover { background: rgba(255,255,255,0.07); }

/* ---- grade de veículos ---- */

.grade-veiculos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1.1rem;
}

.card-veiculo {
  background: var(--asfalto-alt);
  border: 1px solid var(--linha);
  border-radius: 14px;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  position: relative;
  overflow: hidden;
}

.card-veiculo::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--sinal);
  opacity: 0.85;
}

.card-veiculo__topo {
  display: flex; align-items: center; justify-content: space-between;
}

.card-veiculo__tag {
  display: flex; align-items: center; gap: 0.35rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--sinal);
  font-weight: 600;
}

.pill {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.55rem;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.pill--verde { background: var(--verde-fraco); color: #8FD9AE; }
.pill--vermelho { background: var(--vermelho-fraco); color: #E8A2A2; }
.pill--cinza { background: rgba(255,255,255,0.08); color: var(--papel-fraco); }

.card-veiculo__nome {
  font-family: 'Oswald', sans-serif;
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0;
}
.card-veiculo__nome em { font-style: normal; color: var(--sinal); }

.card-veiculo__ano {
  font-size: 0.78rem;
  color: var(--papel-fraco);
  margin-top: -0.5rem;
}

.placa {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--papel);
  color: var(--asfalto);
  border-radius: 6px;
  padding: 0.3rem 0.55rem;
  border: 2px solid var(--asfalto);
  box-shadow: 0 2px 0 rgba(0,0,0,0.3);
}

.placa--off { opacity: 0.55; }

.placa__pais {
  font-family: 'Oswald', sans-serif;
  font-size: 0.62rem;
  font-weight: 700;
  background: #1351A8;
  color: white;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.placa__codigo {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
}

.specs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem 1rem;
  margin: 0;
}

.spec dt {
  display: flex; align-items: center; gap: 0.3rem;
  font-size: 0.7rem;
  color: var(--papel-fraco);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.spec dd {
  margin: 0.1rem 0 0 0;
  font-size: 0.88rem;
  font-weight: 500;
}

.opcionais {
  display: flex; flex-wrap: wrap; gap: 0.35rem;
}

.opcionais__item {
  font-size: 0.7rem;
  background: rgba(245,183,0,0.1);
  color: var(--sinal);
  border: 1px solid rgba(245,183,0,0.25);
  border-radius: 100px;
  padding: 0.2rem 0.55rem;
}

.aviso-manutencao {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.74rem;
  color: #E8C27A;
  background: rgba(245,183,0,0.08);
  border-left: 2px solid var(--sinal);
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
}

.card-veiculo__rodape {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: auto;
  padding-top: 0.6rem;
  border-top: 1px solid var(--linha);
}

.diaria { display: flex; flex-direction: column; line-height: 1.1; }
.diaria__valor { font-family: 'JetBrains Mono', monospace; font-weight: 600; font-size: 1.05rem; }
.diaria__label { font-size: 0.68rem; color: var(--papel-fraco); }

.card-veiculo__acoes { display: flex; align-items: center; gap: 0.4rem; }

/* ---- modal ---- */

.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(8,9,11,0.72);
  display: flex; align-items: center; justify-content: center;
  padding: 1.2rem;
  z-index: 50;
  animation: fade-in 0.15s ease;
}

@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

.modal {
  background: var(--asfalto-alt);
  border: 1px solid var(--linha);
  border-radius: 14px;
  width: 100%;
  max-width: 480px;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.modal__topo {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.1rem 1.3rem;
  border-bottom: 1px solid var(--linha);
}

.modal__topo h3 {
  display: flex; align-items: center; gap: 0.5rem;
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  color: var(--sinal);
}

.modal__topo button {
  background: none; border: none; color: var(--papel-fraco); cursor: pointer;
  display: flex;
}
.modal__topo button:hover { color: var(--papel); }

.modal__corpo { padding: 1.3rem; }

/* ---- formulários ---- */

.formulario { display: flex; flex-direction: column; gap: 0.9rem; }

.campo { display: flex; flex-direction: column; gap: 0.32rem; }
.campo span { font-size: 0.76rem; color: var(--papel-fraco); }

.campo input, .campo select, .campo textarea {
  background: var(--asfalto);
  border: 1px solid var(--linha);
  color: var(--papel);
  border-radius: 7px;
  padding: 0.55rem 0.7rem;
  font-size: 0.88rem;
  font-family: 'Inter', sans-serif;
  outline: none;
}

.campo input:focus, .campo select:focus, .campo textarea:focus {
  border-color: var(--sinal);
}

.campo--checkbox { flex-direction: row; align-items: center; gap: 0.5rem; }
.campo--checkbox input { width: 16px; height: 16px; }

.campo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}

.formulario__acoes {
  display: flex; justify-content: flex-end; gap: 0.6rem;
  margin-top: 0.4rem;
}

.erro-form {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.8rem;
  color: #E8A2A2;
  background: var(--vermelho-fraco);
  padding: 0.55rem 0.7rem;
  border-radius: 7px;
  margin: 0;
}

.texto-modal { font-size: 0.85rem; color: var(--papel-fraco); margin: 0; }

.resumo-veiculo {
  display: flex; align-items: center; gap: 0.6rem;
  background: var(--asfalto);
  border: 1px solid var(--linha);
  border-radius: 9px;
  padding: 0.7rem 0.9rem;
  color: var(--sinal);
}

.resumo-veiculo strong { display: block; color: var(--papel); font-size: 0.92rem; }
.resumo-veiculo span:not(.resumo-veiculo__diaria) { font-size: 0.76rem; color: var(--papel-fraco); }
.resumo-veiculo__diaria { margin-left: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }

.total-reserva {
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(245,183,0,0.08);
  border: 1px solid rgba(245,183,0,0.25);
  border-radius: 9px;
  padding: 0.7rem 0.9rem;
  font-size: 0.85rem;
}
.total-reserva strong { font-family: 'JetBrains Mono', monospace; font-size: 1.05rem; color: var(--sinal); }

/* ---- clientes ---- */

.grade-clientes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.card-cliente {
  display: flex; align-items: center; gap: 0.85rem;
  background: var(--asfalto-alt);
  border: 1px solid var(--linha);
  border-radius: 12px;
  padding: 1rem 1.1rem;
}

.card-cliente__avatar {
  width: 42px; height: 42px;
  border-radius: 50%;
  background: var(--sinal);
  color: var(--asfalto);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Oswald', sans-serif;
  font-weight: 600;
  flex-shrink: 0;
}

.card-cliente__info { display: flex; flex-direction: column; gap: 0.1rem; flex: 1; min-width: 0; }
.card-cliente__info strong { font-size: 0.94rem; }
.card-cliente__info span { font-size: 0.76rem; color: var(--papel-fraco); }

.card-cliente__contagem {
  display: flex; flex-direction: column; align-items: center;
  background: var(--asfalto);
  border-radius: 8px;
  padding: 0.4rem 0.7rem;
  min-width: 56px;
}
.card-cliente__contagem span { font-family: 'JetBrains Mono', monospace; font-weight: 600; font-size: 1rem; }
.card-cliente__contagem small { font-size: 0.62rem; color: var(--papel-fraco); }

/* ---- tabela ---- */

.tabela-wrap { overflow-x: auto; border: 1px solid var(--linha); border-radius: 12px; }

.tabela { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.tabela thead { background: var(--asfalto-alt); }
.tabela th {
  text-align: left;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--papel-fraco);
  padding: 0.7rem 1rem;
  font-weight: 600;
}
.tabela td { padding: 0.65rem 1rem; border-top: 1px solid var(--linha); }
.tabela__linha--cancelada { opacity: 0.5; }

.link-acao {
  background: none; border: none; color: var(--sinal);
  font-size: 0.78rem; font-weight: 600; cursor: pointer;
  text-decoration: underline;
}

/* ---- relatório ---- */

.relatorio { display: flex; flex-direction: column; gap: 1.6rem; }

.relatorio__grade {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.9rem;
}

.metrica {
  background: var(--asfalto-alt);
  border: 1px solid var(--linha);
  border-radius: 12px;
  padding: 1rem 1.1rem;
  display: flex; flex-direction: column; gap: 0.25rem;
}
.metrica--destaque { border-color: var(--sinal); background: rgba(245,183,0,0.07); }
.metrica__valor { font-family: 'Oswald', sans-serif; font-size: 1.5rem; font-weight: 600; }
.metrica--destaque .metrica__valor { color: var(--sinal); }
.metrica__label { font-size: 0.74rem; color: var(--papel-fraco); }

.relatorio__bloco h4 {
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--papel-fraco);
  margin: 0 0 0.8rem 0;
}

.barra-composicao { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.barra-composicao__item {
  display: flex; align-items: center; gap: 0.4rem;
  background: var(--asfalto-alt);
  border: 1px solid var(--linha);
  border-radius: 9px;
  padding: 0.5rem 0.8rem;
  font-size: 0.82rem;
  color: var(--sinal);
}
.barra-composicao__item strong { color: var(--papel); margin-left: 0.2rem; }

/* ---- vazio ---- */

.vazio {
  display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
  padding: 3.5rem 1rem;
  color: var(--papel-fraco);
  text-align: center;
  border: 1px dashed var(--linha);
  border-radius: 14px;
}
.vazio p { margin: 0; font-size: 0.88rem; max-width: 320px; }

/* ---- toasts ---- */

.toast-stack {
  position: fixed;
  bottom: 1.2rem;
  right: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 60;
  max-width: 320px;
}

.toast {
  display: flex; align-items: center; gap: 0.5rem;
  background: var(--asfalto-alt);
  border: 1px solid var(--linha);
  border-radius: 9px;
  padding: 0.65rem 0.8rem;
  font-size: 0.82rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
  animation: slide-in 0.18s ease;
}
@keyframes slide-in { from { transform: translateX(12px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

.toast--sucesso { border-color: rgba(62,124,89,0.5); color: #8FD9AE; }
.toast--erro { border-color: rgba(162,59,59,0.5); color: #E8A2A2; }
.toast button { margin-left: auto; background: none; border: none; color: inherit; opacity: 0.7; cursor: pointer; }
.toast button:hover { opacity: 1; }

/* ---- responsivo ---- */

@media (max-width: 720px) {
  .topo { padding: 1.1rem 1.2rem; }
  .topo__abas { width: 100%; overflow-x: auto; }
  .conteudo { padding: 1.2rem; }
  .campo-grid { grid-template-columns: 1fr; }
  .card-veiculo__rodape { flex-direction: column; align-items: stretch; gap: 0.7rem; }
  .card-veiculo__acoes { justify-content: stretch; }
  .card-veiculo__acoes .btn-primario { flex: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .modal-backdrop, .toast { animation: none; }
}
`;
