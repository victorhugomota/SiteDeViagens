import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import type { Trip } from '../types/trip';
import { formatCurrency } from '../utils/formatters';

interface TripCalendarProps {
  trips: Trip[];
  onSelectTrip: (trip: Trip) => void;
}

export const TripCalendar: React.FC<TripCalendarProps> = ({ trips, onSelectTrip }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Primeiro dia do mês
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Total de dias no mês
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Encontra as viagens que caem em um determinado dia do mês
  const getTripsForDay = (dayNumber: number) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(dayNumber).padStart(2, '0');
    const targetDateStr = `${year}-${monthStr}-${dayStr}`;

    return trips.filter((trip) => {
      return targetDateStr >= trip.startDate && targetDateStr <= trip.endDate;
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 shadow-2xl backdrop-blur-md space-y-6">
      
      {/* Cabeçalho do Calendário */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Agenda de Viagens
          </h2>
          <p className="text-xs text-slate-400">Visualização cronológica das suas viagens planejadas e concluídas</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 hover:bg-cyan-900 transition-colors cursor-pointer"
          >
            Hoje
          </button>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span className="px-3 font-bold text-sm text-slate-200 min-w-[130px] text-center">
              {monthNames[month]} {year}
            </span>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid do Calendário */}
      <div className="grid grid-cols-7 gap-2">
        
        {/* Cabeçalho dos dias da semana */}
        {daysOfWeek.map((day, idx) => (
          <div
            key={day}
            className={`text-center text-xs font-semibold py-2 uppercase tracking-wider ${
              idx === 0 || idx === 6 ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            {day}
          </div>
        ))}

        {/* Células vazias do mês anterior */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="min-h-[100px] bg-slate-950/30 rounded-2xl border border-slate-800/30 p-2 opacity-30"
          />
        ))}

        {/* Dias do mês atual */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const dayNumber = index + 1;
          const monthStr = String(month + 1).padStart(2, '0');
          const dayStr = String(dayNumber).padStart(2, '0');
          const dateStr = `${year}-${monthStr}-${dayStr}`;

          const isToday = dateStr === todayStr;
          const dayTrips = getTripsForDay(dayNumber);

          return (
            <div
              key={dayNumber}
              className={`min-h-[110px] rounded-2xl border p-2 flex flex-col justify-between transition-all duration-200 ${
                isToday
                  ? 'bg-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Número do Dia */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'text-slate-300'
                  }`}
                >
                  {dayNumber}
                </span>

                {dayTrips.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                )}
              </div>

              {/* Badges das Viagens do Dia */}
              <div className="space-y-1 mt-1 overflow-hidden max-h-[75px]">
                {dayTrips.map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => onSelectTrip(trip)}
                    className="p-1.5 rounded-xl bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border border-blue-700/60 hover:border-cyan-400 hover:brightness-125 text-[11px] text-white cursor-pointer shadow-md transition-all truncate"
                  >
                    <div className="font-semibold truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-300 shrink-0" />
                      <span className="truncate">{trip.title || trip.destinationAddress}</span>
                    </div>
                    <div className="text-[10px] text-cyan-200 flex items-center justify-between mt-0.5">
                      <span>{formatCurrency(trip.totalEstimateCost || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      </div>

    </div>
  );
};
