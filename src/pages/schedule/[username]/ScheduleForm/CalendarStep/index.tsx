import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useState } from "react";
import { Calendar } from "../../../../../components/Calendar";
import { api } from "../../../../../lib/axios";
import { Container, TimePicker, TimePickerHeader, TimePickerItem, TimePickerList } from "./styles";

interface Availability {
	possibleTimes: number[];
	availableTimes: number[];
}

interface CalendarStepProps {
	onSelectDateTime: (data: Date) => void;
}

export function CalendarStep({ onSelectDateTime }: CalendarStepProps) {
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	// const [availability, setAvailability] = useState<Availability | null>(null);

	const router = useRouter();

	const isDateSelected = !!selectedDate;
	const username = String(router.query.username);

	const weekDay = selectedDate ? dayjs(selectedDate).format('dddd') : null;
	const describedDate = selectedDate ? dayjs(selectedDate).format('DD[ de ]MMMM') : null;

	const selectedDateWithoutTime = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null;

	// UseQuery substitui a chamada a API feita anteriormente dentro do useEffect comentado
	const { data: availability } = useQuery<Availability>(['availability', selectedDateWithoutTime], async () => {
		const response = await api.get(`/users/${username}/availability`, {
			params: {
				date: selectedDateWithoutTime,
			}
		});

		return response.data;
	}, {
		enabled: !!selectedDate,
	});

	// useEffect(() => {
	// 	if (!selectedDate) {
	// 		return;
	// 	}

	// 	api.get(`/users/${username}/availability`, {
	// 		params: {
	// 			date: dayjs(selectedDate).format('YYYY-MM-DD'),
	// 		}
	// 	}).then(response => {
	// 		setAvailability(response.data)
	// 	})
	// }, [selectedDate, username]);

	function handleSelectTime(hour: number) {
		const dateWithTime = dayjs(selectedDate).set("hour", hour).startOf('hour').toDate();

		onSelectDateTime(dateWithTime);
	}

	return (
		<Container isTimePickerOpen={isDateSelected}>
			<Calendar selectedDate={selectedDate} onSelectedDate={setSelectedDate} />

			{isDateSelected && (
				<TimePicker>
					<TimePickerHeader>
						{weekDay} <span>{describedDate}</span>
					</TimePickerHeader>

					<TimePickerList>
						{availability?.possibleTimes.map(hour => {
							return (
								<TimePickerItem
									key={hour}
									onClick={() => handleSelectTime(hour)}
									disabled={!availability.availableTimes.includes(hour)}
								>
									{String(hour).padStart(2, '0')}:00h
								</TimePickerItem>
							)
						})}
					</TimePickerList>
				</TimePicker>
			)}
		</Container>
	)
}