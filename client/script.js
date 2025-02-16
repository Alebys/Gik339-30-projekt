// DOM Elements
const carForm = document.getElementById('carForm');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modalMessage');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');
// Input fields
const brandInput = document.getElementById('brand');
const colorInput = document.getElementById('color');
const yearInput = document.getElementById('year');
const idInput = document.getElementById('id');

let selectedCarId = null; 
let actionToPerform = null; 

function getCarData() {
    const brand = brandInput.value.trim();
    const color = colorInput.value.trim();
    const year = yearInput.value.trim();

    if (!brand || !color || !year) {
        alert('Alla fält måste fyllas i!');
        return null;
    }

    return { brand, color, year };
}

function selectCar(car) {
    selectedCarId = car.id;
    brandInput.value = car.brand;
    colorInput.value = car.color;
    yearInput.value = car.year;
    idInput.value = car.id;
}

async function loadCars() {
    try {
        const response = await fetch('http://localhost:3000/cars');
        const cars = await response.json();
        renderCarList(cars);
    } catch (error) {
        console.error('Error loading cars:', error);
    }
}

function renderCarList(cars) {
    const existingList = document.getElementById('clist');
    if (existingList) existingList.remove();

    if (cars.length > 0) {
        const container = document.createElement('div');
        container.className = 'w-full px-4 mt-8 flex justify-center';

        const list = document.createElement('div');
        list.id = 'clist';
        list.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

        cars.forEach(car => {
            const carDiv = document.createElement('div');
            carDiv.className = "p-4 bg-[#B0B0B0] text-white rounded-xl border-2 border-[#3a0d1f] shadow-lg hover:shadow-xl cursor-pointer transition-transform duration-300 hover:scale-105 hover:bg-[#9C9C9C]";
            carDiv.setAttribute('data-id', car.id);

            carDiv.innerHTML = `
                <div class="font-bold" style="color: ${car.color}">${car.brand}</div>
                <div class="font-medium" style="color: ${car.color}">${car.color}</div>
                <div class="text-sm">Årsmodell: ${car.year}</div>
            `;

            carDiv.addEventListener('click', () => {
                selectCar(car);
            });

            list.appendChild(carDiv);
        });

        container.appendChild(list);
        document.body.appendChild(container);
    }
}

async function performAction() {
    const carData = getCarData();
    if (!carData) return;

    let url, method;
    if (selectedCarId) {
        url = `http://localhost:3000/cars/${selectedCarId}`;
        method = 'PUT';
    } else {
        url = 'http://localhost:3000/cars';
        method = 'POST';
    }

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(carData)
        });

        if (response.ok) {
            loadCars(); 
            clearInputs(); 
            selectedCarId = null; 
        } else {
            const error = await response.json();
            alert(error.error);
        }
    } catch (error) {
        console.error(`Error performing action: ${method} ${url}`, error);
    } finally {
        hideModal(); 
    }
}

// Delete a car
async function deleteCar() {
    try {
        const response = await fetch(`http://localhost:3000/cars/${selectedCarId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadCars(); 
            clearInputs(); 
            selectedCarId = null; 
            showModal('Bilen har tagits bort.');
        } else {
            throw new Error('Delete failed');
        }
    } catch (error) {
        alert('Kunde inte ta bort bilen.');
    } finally {
        hideModal();
    }
}

carForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const actionMessage = selectedCarId ? 'Vill du verkligen uppdatera denna bil?' : 'Vill du verkligen lägga till denna bil?';
    showModal(actionMessage);
    actionToPerform = performAction;
});

document.getElementById('updateButton').addEventListener('click', () => {
    if (!selectedCarId) {
        alert('Ingen bil vald för uppdatering!');
        return;
    }

    showModal('Vill du verkligen uppdatera denna bil?');
    actionToPerform = performAction;
});

document.getElementById('deleteButton').addEventListener('click', () => {
    if (!selectedCarId) {
        alert('Ingen bil vald för borttagning!');
        return;
    }

    showModal('Vill du verkligen ta bort denna bil?');
    actionToPerform = deleteCar;
});

function clearInputs() {
    brandInput.value = '';
    colorInput.value = '';
    yearInput.value = '';
    idInput.value = '';
}

function showModal(message) {
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    modalMessage.textContent = message;
}

function hideModal() {
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

modalCancel.addEventListener('click', hideModal);
modalConfirm.addEventListener('click', () => {
    if (typeof actionToPerform === 'function') {
        actionToPerform(); 
    }
});

document.addEventListener('DOMContentLoaded', loadCars);