const defaultRooms = [
    {
        number: 101,
        type: 'Стандарт',
        price: 900,
        status: 'Вільний',
        description: 'Одномісний номер із базовими зручностями.'
    },
    {
        number: 102,
        type: 'Стандарт',
        price: 1100,
        status: 'Вільний',
        description: 'Двомісний номер для короткого проживання.'
    },
    {
        number: 201,
        type: 'Напівлюкс',
        price: 1700,
        status: 'Заброньований',
        description: 'Просторий номер із покращеним комфортом.'
    },
    {
        number: 202,
        type: 'Люкс',
        price: 2500,
        status: 'Вільний',
        description: 'Комфортний номер підвищеної категорії.'
    },
    {
        number: 301,
        type: 'Сімейний',
        price: 2200,
        status: 'Зайнятий',
        description: 'Номер для сімейного проживання.'
    },
    {
        number: 302,
        type: 'Апартаменти',
        price: 3200,
        status: 'Вільний',
        description: 'Апартаменти з окремою зоною відпочинку.'
    }
];

let rooms = loadRooms();
let bookings = loadBookings();

function loadRooms() {
    const saved = localStorage.getItem('hotelRooms');
    if (!saved) {
        localStorage.setItem('hotelRooms', JSON.stringify(defaultRooms));
        return [...defaultRooms];
    }

    try {
        return JSON.parse(saved);
    } catch (error) {
        localStorage.setItem('hotelRooms', JSON.stringify(defaultRooms));
        return [...defaultRooms];
    }
}

function saveRooms() {
    localStorage.setItem('hotelRooms', JSON.stringify(rooms));
}

function loadBookings() {
    const saved = localStorage.getItem('hotelBookings');
    if (!saved) {
        return [];
    }

    try {
        return JSON.parse(saved);
    } catch (error) {
        return [];
    }
}

function saveBookings() {
    localStorage.setItem('hotelBookings', JSON.stringify(bookings));
}

function getStatusClass(status) {
    if (status === 'Вільний') return 'status-free';
    if (status === 'Заброньований') return 'status-booked';
    if (status === 'Зайнятий') return 'status-busy';
    return '';
}

function renderStatistics() {
    const statistics = document.getElementById('statistics');
    if (!statistics) return;

    const total = rooms.length;
    const free = rooms.filter(room => room.status === 'Вільний').length;
    const booked = rooms.filter(room => room.status === 'Заброньований').length;
    const busy = rooms.filter(room => room.status === 'Зайнятий').length;

    statistics.innerHTML = `
        <div class="stat-card">
            <h3>Усього номерів</h3>
            <p>${total}</p>
        </div>
        <div class="stat-card">
            <h3>Вільні</h3>
            <p>${free}</p>
        </div>
        <div class="stat-card">
            <h3>Заброньовані</h3>
            <p>${booked}</p>
        </div>
        <div class="stat-card">
            <h3>Зайняті</h3>
            <p>${busy}</p>
        </div>
    `;
}

function renderRooms(roomList = rooms) {
    const roomsList = document.getElementById('roomsList');
    if (!roomsList) return;

    if (roomList.length === 0) {
        roomsList.innerHTML = '<p>Номерів за заданими умовами не знайдено.</p>';
        return;
    }

    roomsList.innerHTML = roomList.map(room => `
        <article class="room-card">
            <h3>Номер ${room.number}</h3>
            <p><strong>Тип:</strong> ${room.type}</p>
            <p><strong>Ціна:</strong> ${room.price} грн/доба</p>
            <p><strong>Статус:</strong> <span class="${getStatusClass(room.status)}">${room.status}</span></p>
            <p>${room.description}</p>
        </article>
    `).join('');
}

function renderBookings() {
    const bookingsList = document.getElementById('bookingsList');
    if (!bookingsList) return;

    if (bookings.length === 0) {
        bookingsList.innerHTML = '<p>Поки що бронювань немає.</p>';
        return;
    }

    bookingsList.innerHTML = bookings.map(booking => `
        <article class="booking-item">
            <p><strong>Клієнт:</strong> ${booking.clientName}</p>
            <p><strong>Телефон:</strong> ${booking.clientPhone}</p>
            <p><strong>Email:</strong> ${booking.clientEmail}</p>
            <p><strong>Номер кімнати:</strong> ${booking.roomNumber}</p>
            <p><strong>Період:</strong> ${booking.checkInDate} — ${booking.checkOutDate}</p>
            <button class="cancel-button" onclick="cancelBooking(${booking.id})">Скасувати бронювання</button>
        </article>
    `).join('');
}

function filterRooms() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');

    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const statusValue = statusFilter ? statusFilter.value : 'all';

    const filteredRooms = rooms.filter(room => {
        const matchesType = room.type.toLowerCase().includes(searchValue);
        const matchesStatus = statusValue === 'all' || room.status === statusValue;
        return matchesType && matchesStatus;
    });

    renderRooms(filteredRooms);
}

function resetFilters() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');

    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = 'all';

    renderRooms();
}

function bookRoom(event) {
    event.preventDefault();

    const clientName = document.getElementById('clientName').value.trim();
    const clientPhone = document.getElementById('clientPhone').value.trim();
    const clientEmail = document.getElementById('clientEmail').value.trim();
    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;
    const roomNumber = Number(document.getElementById('roomNumber').value);

    if (!clientName || !clientPhone || !clientEmail || !checkInDate || !checkOutDate || !roomNumber) {
        alert('Заповніть усі поля форми бронювання.');
        return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
        alert('Дата виїзду має бути пізніше дати заїзду.');
        return;
    }

    const room = rooms.find(item => item.number === roomNumber);

    if (!room) {
        alert('Номер кімнати не знайдено.');
        return;
    }

    if (room.status !== 'Вільний') {
        alert('Цей номер зараз недоступний для бронювання.');
        return;
    }

    const booking = {
        id: Date.now(),
        clientName,
        clientPhone,
        clientEmail,
        checkInDate,
        checkOutDate,
        roomNumber
    };

    bookings.push(booking);
    room.status = 'Заброньований';

    saveBookings();
    saveRooms();

    event.target.reset();
    renderStatistics();
    renderRooms();
    renderBookings();

    alert('Бронювання успішно створено.');
}

function cancelBooking(bookingId) {
    const booking = bookings.find(item => item.id === bookingId);
    if (!booking) return;

    bookings = bookings.filter(item => item.id !== bookingId);

    const room = rooms.find(item => item.number === booking.roomNumber);
    if (room && room.status === 'Заброньований') {
        room.status = 'Вільний';
    }

    saveBookings();
    saveRooms();

    renderStatistics();
    renderRooms();
    renderBookings();
}

function initializeApp() {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', bookRoom);
    }

    renderStatistics();
    renderRooms();
    renderBookings();
}

window.addEventListener('DOMContentLoaded', initializeApp);
