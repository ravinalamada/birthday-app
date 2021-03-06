import { body, list, addBtn, filterSearchInput, filterMonthInput } from './elements.js';
import { displayPerson} from './displayList';

// Fetch data from people.json file
export async function fetchPerson() {
  const response = await fetch('https://gist.githubusercontent.com/Pinois/e1c72b75917985dc77f5c808e876b67f/raw/b17e08696906abeaac8bc260f57738eaa3f6abb1/birthdayPeople.json');
  let people = await response.json();

  // Display person list
  function displayList(upadatedPeople) {
    const peopleToDisplay = upadatedPeople && upadatedPeople.length ? upadatedPeople : people;
    const html = displayPerson(peopleToDisplay)
    list.innerHTML = html;
  }

  displayList();

  function filterByName(peopleToFilter) {
    if(filterSearchInput.value !== "") {
      return peopleToFilter.filter(person => {
        const fullNameLowercase =
            person.firstName.toLowerCase() + ' ' + person.lastName.toLowerCase();
        return fullNameLowercase.includes(filterSearchInput.value.toLowerCase());
    });
  }
  return peopleToFilter;
  }

  function filterByMonth(peopleToFilter) {
    if(filterMonthInput.value !== "month") {
       return peopleToFilter.filter(person => {
          let birthday = new Date(person.birthday);
          const birthdayMonth = birthday.getMonth() + 1;
          const selectedMonth = Number(filterMonthInput.value);
          const condition = birthdayMonth === selectedMonth;
          return condition;
      });
  }
  return peopleToFilter;
  }

  function filterBothNameAndMonth() {
    const getPeopleByName = filterByName(people);
    const getPeopleByNameAndMonth = filterByMonth(getPeopleByName);
    const filteredPeople = displayPerson(getPeopleByNameAndMonth);
    list.innerHTML = filteredPeople;
  }

  // Set the time that you want to run another people
  const setTimeOut = (ms = 0) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  // This function destroy the popup
  async function destroyPopup(popup) {
    await setTimeOut(100);
    // remove it from the DOM
    popup.remove();
    // remove it from the js memory
    popup = null;
    body.style.overflow = 'visible';
  }

  // edit the popup
  function editPopup(id) {
    const personToEdit = people.find(person => person.id == id);
    const birthday = new Date(personToEdit.birthday).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    return new Promise(async function () {
      const popup = document.createElement('form');
      popup.classList.add('popup');
      popup.insertAdjacentHTML('afterbegin', `
              <div class="popup--container">
                <div class="header--wrapper">
                  <button class="cancelForm close--editPopup">X</button>
                  <h2 class="editPopup__heading">Edit ${personToEdit.lastName} ${personToEdit.firstName}</h2>
                </div>
                <div class="editPopup--wrapper">
                  <fieldset class="editPopup__fieldset">
                    <label class="editPopup__label" for="name">LastName</label>
                    <input type="text" class="editPopup__input" name="lastName" id="name" value="${personToEdit.lastName}"/>
                  </fieldset>
                  <fieldset class="editPopup__fieldset">
                    <label class="editPopup__label" for="firstName">Firstname</label>
                    <input type="text" class="editPopup__input" name="firstName" id="firstName" value="${personToEdit.firstName}"/>
                  </fieldset>
                  <feldset class="editPopup__fieldset">
                    <label class="editPopup__label" for="birthday">Birthday</label>
                    <input type="date" class="editPopup__input" name="birthday" id="birthday" max="${today}" value="${birthday}" />
                  </feldset>
                </div>
                <div class="editPopup__button--wrapper">
                  <button type="submit" class="submit-btn">Save changes</button>
                  <button type="button" class="cancelForm">Cancel</button>
                </div>
              </div>
            `);

      // Submit form that have been edited
      popup.addEventListener('submit', (e) => {
        e.preventDefault();
        personToEdit.lastName = popup.lastName.value;
        personToEdit.firstName = popup.firstName.value;
        const toTimestamp=(strDate)=>{
          let datum = Date.parse(strDate);
          return datum;
       }
       personToEdit.birthday = toTimestamp(popup.birthday.value);
        const upadatedPeople = people.map(person => {
          if(personToEdit.id === person.id) {
            return personToEdit;
          }
          return person
        })
        displayList(upadatedPeople);
        destroyPopup(popup);
        list.dispatchEvent(new CustomEvent('listUpdated'));
      });
      // insert tht popup in the DOM
      document.body.appendChild(popup);
      body.style.overflow = 'hidden';
      //put a very small titmeout before we add the open class
      await setTimeOut(10);
      popup.classList.add('open');
    });
  }

  const editPopupPartener = (e) => {
    const btnEdit = e.target.closest('.edit');
    if (btnEdit) {
      const id = btnEdit.value;
      editPopup(id);
    }
  }

  // Handle the delete button
  const handleDeleteBtn = e => {
    const deleteBtnEl = e.target.matches('button.confirm');
    if (deleteBtnEl) {
      const btn = document.querySelector('.delete');
      const id = btn.value;
      deleteBtn(id);
      const div = document.querySelector('.deleteBtnContainer');
      destroyPopup(div);
    }
  }

  const deleteBtn = (id) => {
    people = people.filter(person => person.id != id);
    list.dispatchEvent(new CustomEvent('listUpdated'));
  };

  // Add a person in the list
  const addPerson = (e) => {
    e.preventDefault();

    const form = document.createElement('form');
    form.classList.add('addPopup');
    form.insertAdjacentHTML('afterbegin', `
            <div class="addPopup--container">
              <div class="header--wrapper">
                <button class="cancelAddForm close--addPopup">X</button>
                <h2 class="addPopup__heading"> Add new people</h2>
              </div>
              <div class="addPopup--wrapper">
                <fieldset class="addPopup__fieldset">
                  <label class="addPopup__label" for="picture">Picture</label>
                  <input type="url"  class="addPopup__input"class="picture" id="picture" name="picture" value="" required/>
                </fieldset>
                <fieldset class="addPopup__fieldset">
                  <label class="addPopup__label" for="name">Lastname</label>
                  <input type="text" class="addPopup__input" id="name" name="lastName" value="" required/>
                </fieldset>
                <fieldset class="addPopup__fieldset">
                  <label class="addPopup__label" for="firstName">Firstname</label>
                  <input type="text" class="addPopup__input" id="firstName" name="firstName" value="" required/>
                </fieldset>
                <fieldset class="addPopup__fieldset">
                  <label class="addPopup__label" for="birthday">Birthday</label>
                  <input type="date" class="addPopup__input" id="birthday" name="birthday" value="" required/>
                </fieldset>
              </div>
              <div class="addPopup__button--wrapper">
                <button type="submit" class="submit-btn">Save</button>
                <button type="button" class="cancelAddForm">Cancel</button>
              </div>
            </div>
            `);

    document.body.appendChild(form);
    document.body.style.overflow = 'hidden';
    const dateInput = document.querySelector('input[type=date]');
    //Converts from Timestamp
    const date = new Date().toISOString().slice(0, 10)
    dateInput.max = date

    const displayNewPer = e => {
      e.preventDefault();
      const formEl = e.target;
      const newPerson = {
        lastName: formEl.lastName.value,
        firstName: formEl.firstName.value,
        birthday: formEl.birthday.value,
        picture: formEl.picture.value,
        id: Date.now(),
      };
      people.push(newPerson);
      list.dispatchEvent(new CustomEvent('listUpdated'));
      formEl.reset();
      destroyPopup(formEl);
    };

    form.addEventListener('submit', displayNewPer);
  };

  // Handle click buttons
  const handleClick = (e) => {
    const buttons = e.target;
    const deleteBtn = e.target.closest('button.delete');
    const findIdToDelete = people.find(person => person.id == buttons.value);
    if (deleteBtn) {
      return new Promise(async function (resolve) {
        const div = document.createElement('div');
        div.classList.add('deleteBtnContainer');
        div.insertAdjacentHTML('afterbegin', `
          <div class="deleteBtnWrapper">
            <div>
              <button type="button" class="cancel closeDeletePopup">X</button>
              <p class="confirmParagraph">Are you sure you want to delete ${findIdToDelete.lastName} ${findIdToDelete.firstName}?</p>
            </div>
            <div class="btnWrapper">
              <button type="button" class="confirm">Yes</button>
              <button type="button" class="cancel">No</button>
            </div>
          </div>
      `);
        document.body.appendChild(div);
        //put a very small titmeout before we add the open class
        await setTimeOut(10);
        div.classList.add('open');
        body.style.overflow = 'hidden';
      });
    }

    if (e.target.closest('.cancel')) {
      const divEl = document.querySelector('.deleteBtnContainer');
      destroyPopup(divEl);
    }

    if (e.target.matches('button.cancelForm')) {
      const form = document.querySelector('.popup');
      destroyPopup(form);
      // body.style.overflow = 'visible';
    };

    if (e.target.matches('button.cancelAddForm')) {
      const addForm = document.querySelector('.addPopup');
      destroyPopup(addForm);
    };

  }

  // Store the songs in the local storage
  const setToLocalStorage = () => {
    const objectStringyfy = JSON.stringify(people);
    localStorage.setItem('people', objectStringyfy);
  };

  const restoreFromLocalStorage = () => {
    const personLs = JSON.parse(localStorage.getItem('people'));
    if (personLs) {
    people = personLs;
      list.dispatchEvent(new CustomEvent('listUpdated'));
    };
  }

  // Listen to the events
  window.addEventListener('click', handleDeleteBtn);
  window.addEventListener('click', handleClick);
  addBtn.addEventListener('click', addPerson);
  list.addEventListener('click', editPopupPartener);
  list.addEventListener('listUpdated', displayList, people);
  list.addEventListener('listUpdated', setToLocalStorage);
  filterSearchInput.addEventListener('keyup',()=> filterBothNameAndMonth());
  filterMonthInput.addEventListener('change', () => filterBothNameAndMonth());
  restoreFromLocalStorage();
  displayList(people)

};
fetchPerson();



