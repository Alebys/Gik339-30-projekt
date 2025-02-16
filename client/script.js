// DOM Element
const carForm = document.getElementById('carForm');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modalMessage');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');

// formulärfält
const brandInput = document.getElementById('brand');
const colorInput = document.getElementById('color');
const yearInput = document.getElementById('year');
const idInput = document.getElementById('id');

let selectedCarId = null; // Variabel för att hålla reda på vald bil
let actionToPerform = null; // Variabel för att hålla reda på vilken handling som ska utföras

// Hämta data från formuläret
function getCarData() {
    const brand = brandInput.value.trim();
    const color = colorInput.value.trim();
    const year = yearInput.value.trim();

    if (!brand || !color || !year) {
        alert('Alla fält måste fyllas i!');
        return null;
    }

    return { brand, color, year }; // Returnera data 
}

// Välj en bil för redigering
function selectCar(car) {
    selectedCarId = car.id;
    brandInput.value = car.brand;
    colorInput.value = car.color;
    yearInput.value = car.year;
    idInput.value = car.id;
}

// Ladda alla bilar från servern
async function loadCars() {
    try {
        const response = await fetch('http://localhost:3000/cars');
        const cars = await response.json();
        renderCarList(cars); // Visa listan med bilar
    } catch (error) {
        console.error('Error loading cars:', error);
    }
}

// Rendera bil listan
function renderCarList(cars) {
    const existingList = document.getElementById('clist');
    if (existingList) existingList.remove(); // Ta bort eventuell tidigare lista

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
                selectCar(car); // Välj bilen när man klickar på en bil
            });

            list.appendChild(carDiv); // Lägg till bilen i listan
        });

        container.appendChild(list); // Lägg till listan i container
        document.body.appendChild(container); // Lägg till containern i body
    }
}
// Utför handlingen (lägga till eller uppdatera en bil)
async function performAction() {
    const carData = getCarData(); // Hämta bilens data från formuläret
    if (!carData) return; // Om datan är ogiltig, gör inget

    let url, method;
    let successMessage = "";

    // Om en bil är vald genom en id, uppdatera den; annars läggs det till en ny bil
    if (selectedCarId) {
        url = `http://localhost:3000/cars/${selectedCarId}`;
        method = 'PUT';
        successMessage = 'Bilen har uppdaterats!';
    } else {
        url = 'http://localhost:3000/cars';
        method = 'POST';
        successMessage = 'Bilen har lagts till!';
    }

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(carData) // Skicka bilens data som JSON
        });

        if (response.ok) {
            await loadCars(); // Ladda om bilarna
            clearInputs(); // Rensa input-fälten
            selectedCarId = null; // Återställ vald bil
            showModal(successMessage, true); // medelande om att bilen har lagts till eller uppdaterats
        } else {
            const error = await response.json();
            alert(error.error); // Visa felmeddelande
        }
    } catch (error) {
        console.error(`Error performing action: ${method} ${url}`, error);
    }
}

// Tar bort en bil
async function deleteCar() {
    try {
        const response = await fetch(`http://localhost:3000/cars/${selectedCarId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadCars(); // Ladda om bilarna
            clearInputs(); // Rensa input
            selectedCarId = null; // Återställ vald bil
            showModal('Bilen har tagits bort'); // medelande om att bilen har tagits bort
        } else {
            throw new Error('Delete misslyckades!');
        }
    } catch (error) {
        alert('Kunde inte ta bort bilen.'); // Visa felmeddelande
    }
}

// Hantera formulärsändning
carForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Förhindra att sidan laddas om
    const actionMessage = selectedCarId ? 'Vill du verkligen uppdatera denna bil?' : 'Vill du verkligen lägga till denna bil?';
    showModal(actionMessage); // Visa modal med bekräftelse
    actionToPerform = performAction; // Sätt handlingen att vara lägg till/uppdatera
});

// Uppdaterar bil
document.getElementById('updateButton').addEventListener('click', () => {
    if (!selectedCarId) {
        alert('Ingen bil vald för uppdatering!'); // Om ingen bil är vald
        return;
    }

    showModal('Vill du verkligen uppdatera denna bil?');
    actionToPerform = performAction; // Sätt handlingen att vara uppdatering
});

// Tar bort bil
document.getElementById('deleteButton').addEventListener('click', () => {
    if (!selectedCarId) {
        alert('Ingen bil vald för borttagning!'); // Om ingen bil är vald
        return;
    }

    showModal('Vill du verkligen ta bort denna bil?');
    actionToPerform = deleteCar; // Sätter bortagning som handling
});

// Rensa alla inputfält
function clearInputs() {
    brandInput.value = '';
    colorInput.value = '';
    yearInput.value = '';
    idInput.value = '';
}

// Visa modalen
function showModal(message, isFinalMessage = false) {
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    modalMessage.textContent = message;

}

// Dölja modalen
function hideModal() {
  modal.classList.add('opacity-0');
  setTimeout(() => modal.classList.add('hidden'), 3000);
}

// Stäng modal vid avbryt
modalCancel.addEventListener('click', hideModal);

// Bekräfta handling i modal
modalConfirm.addEventListener('click', async () => {
    if (typeof actionToPerform === 'function') {
        await actionToPerform(); // Vänta tills handlingen är klar
        hideModal(); // Stäng modal efter att handlingen är klar
        actionToPerform = null; // Förhindra att handlingen utförs två gånger
    }
});

// Ladda bilar när sidan är klar
document.addEventListener('DOMContentLoaded', loadCars);