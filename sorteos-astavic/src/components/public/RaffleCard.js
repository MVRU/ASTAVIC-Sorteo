import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { formatDateEs, getTimeParts } from '../../utils/raffleUtils';

const emojiSet = ['\u{1F389}', '\u{1F38A}', '\u{2728}', '\u{1F388}'];

const RaffleCard = ({
  raffle,
  onLive,
  onMarkFinished,
  onRequestReminder,
}) => {
  const [timeLeft, setTimeLeft] = useState(() => getTimeParts(raffle.datetime));
  const [isFinished, setIsFinished] = useState(() => raffle.finished || timeLeft.diff <= 0);
  const [showConfetti, setShowConfetti] = useState(false);
  const finishedRef = useRef(isFinished);

  useEffect(() => {
    const update = () => {
      const parts = getTimeParts(raffle.datetime);
      setTimeLeft(parts);
      if (parts.diff <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        setIsFinished(true);
        setShowConfetti(true);
        if (onMarkFinished) {
          onMarkFinished(raffle.id);
        }
      }
    };

    update();
    const timerId = window.setInterval(update, 1000);
    return () => window.clearInterval(timerId);
  }, [raffle.id, raffle.datetime, onMarkFinished]);

  useEffect(() => {
    finishedRef.current = raffle.finished;
    setIsFinished(raffle.finished);
  }, [raffle.finished]);

  useEffect(() => {
    if (!showConfetti) {
      return undefined;
    }
    const timeoutId = window.setTimeout(() => setShowConfetti(false), 900);
    return () => window.clearTimeout(timeoutId);
  }, [showConfetti]);

  const watchDisabled = !isFinished;
  const reminderTitle = 'Abrí el formulario para recibir recordatorios por correo';

  return (
    <article className={`card raffle-card${isFinished ? ' raffle-card--finished' : ''}`}>
      {isFinished && <span className="badge">Finalizado</span>}
      <h3 className="raffle-card__title">{raffle.title}</h3>
      <p className="raffle-card__meta">{formatDateEs(raffle.datetime)}</p>
      <div className="countdown" aria-label={`Cuenta regresiva para ${raffle.title}`}>
        {[
          { label: 'dias', value: timeLeft.days },
          { label: 'horas', value: timeLeft.hours },
          { label: 'min', value: timeLeft.minutes },
          { label: 'seg', value: timeLeft.seconds },
        ].map((item) => (
          <div key={item.label} className="countdown__item">
            <div className="countdown__value">{String(item.value).padStart(2, '0')}</div>
            <div className="countdown__label">{item.label}</div>
          </div>
        ))}
      </div>
      {raffle.description && (
        <p className="raffle-card__description">{raffle.description}</p>
      )}
      {Array.isArray(raffle.prizes) && raffle.prizes.length > 0 && (
        <ul className="raffle-card__prizes">
          {raffle.prizes.map((prize, index) => (
            <li key={prize.name || index}>
              <span className="prize-name">
                {prize.name || `Premio ${index + 1}`}
              </span>
              {prize.description && (
                <span className="prize-detail">{prize.description}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="card-actions">
        <button
          type="button"
          className="button button--ghost"
          disabled={watchDisabled}
          onClick={() => onLive(raffle)}
          title={watchDisabled ? 'Disponible cuando llegue la fecha del sorteo' : 'Ver sorteo en vivo'}
        >
          Ver sorteo
        </button>
        <button
          type="button"
          className="button button--primary"
          onClick={() => onRequestReminder(raffle)}
          title={reminderTitle}
        >
          Avisarme por email
        </button>
      </div>
      {showConfetti && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} style={{ left: `${5 + index * 7}%` }}>
              {emojiSet[index % emojiSet.length]}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};

RaffleCard.propTypes = {
  raffle: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    datetime: PropTypes.string.isRequired,
    winnersCount: PropTypes.number.isRequired,
    participants: PropTypes.arrayOf(PropTypes.string).isRequired,
    prizes: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        description: PropTypes.string,
      })
    ),
    finished: PropTypes.bool,
  }).isRequired,
  onLive: PropTypes.func.isRequired,
  onMarkFinished: PropTypes.func,
  onRequestReminder: PropTypes.func.isRequired,
};

RaffleCard.defaultProps = {
  onMarkFinished: undefined,
};

export default RaffleCard;
