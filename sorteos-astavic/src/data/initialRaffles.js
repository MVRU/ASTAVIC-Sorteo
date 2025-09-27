const initialRaffles = [
  {
    id: "bienvenida-primavera-2025",
    title: "Bienvenida Primavera 2025",
    description:
      "Celebramos la nueva estación con premios para socios que acompañan todo el año.",
    datetime: "2025-09-21T18:00:00-03:00",
    winnersCount: 3,
    prizes: [
      { name: "1er premio", description: "Kit de picnic completo ASTAVIC" },
      { name: "2do premio", description: "Par de entradas para evento cultural" },
      { name: "3er premio", description: "Voucher de heladería local" },
    ],
    participants: [
      "Ana Lopez",
      "Bruno Diaz",
      "Carla Mendez",
      "Diego Suarez",
      "Elena Torres",
      "Facundo Ruiz",
      "Gloria Silva",
      "Hernan Flores",
      "Iara Gomez",
      "Joaquin Pereyra",
    ],
    finished: true,
  },
  {
    id: "aniversario-astavic-2025",
    title: "Aniversario ASTAVIC 2025",
    description: "Sorteo central del aniversario institucional.",
    datetime: "2025-12-10T20:30:00-03:00",
    winnersCount: 1,
    prizes: [
      { name: "Premio principal", description: "Televisor LED 50\" 4K" },
    ],
    participants: [
      "Kevin Morales",
      "Lucia Herrera",
      "Martina Bravo",
      "Nicolas Paredes",
      "Olivia Serrano",
      "Pablo Romero",
    ],
    finished: false,
  },
  {
    id: "sorteo-planta-b-2025",
    title: "Sorteo de Planta B - 2025",
    description: "Reconocimiento al esfuerzo del equipo de Planta B.",
    datetime: "2025-09-28T22:00:00-03:00",
    winnersCount: 1,
    prizes: [
      { name: "Premio único", description: "Orden de compra en tienda deportiva" },
    ],
    participants: [
      "Rocio Alvarez",
      "Santiago Medina",
      "Tamara Luna",
      "Ulises Bustos",
      "Valentina Rios",
      "Walter Gimenez",
      "Ximena Acosta",
      "Yamila Duarte",
      "Zoe Marin",
    ],
    finished: false,
  },
  {
    id: "planta-a-2025",
    title: "Sorteo de Planta A - 2025",
    description: "Celebramos los logros de Planta A con un sorteo especial.",
    datetime: "2025-09-28T21:00:00-03:00",
    winnersCount: 1,
    prizes: [
      { name: "Premio único", description: "Fin de semana para dos personas" },
    ],
    participants: [
      "Agustin Castro",
      "Barbara Benitez",
      "Cristian Molina",
      "Daniela Ortiz",
      "Emanuel Caceres",
      "Florencia Navarro",
    ],
    finished: false,
  },
];

export default initialRaffles;

