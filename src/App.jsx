// src/App.jsx
import { useState, useEffect } from 'react';
import * as petService from './services/petService';
import PetList from './components/PetList/PetList';
import PetDetail from './components/PetDetail/PetDetail';
import PetForm from './components/PetForm/PetForm';

const App = () => {
  const [pets, setPets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false); // have the form open and close

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const fetchedPets = await petService.index();
        // Don't forget to pass the error object to the new Error
        if (fetchedPets.err) {
          throw new Error(fetchedPets.err);
        }
        setPets(fetchedPets);
      } catch (err) {
        // Log the error object
        console.log(err);
      }
    };
    fetchPets();
  }, []);

  const handleSelect = (pet) => {
    setSelected(pet)
  }

  const handleFormView = (pet) => {
    setSelected(pet._id ? selected : null);
    setIsFormOpen(!isFormOpen);
  };


  const handleAddPet = async (formData) => {
    try {
      // Call petService.create, assign return value to newPet
      const newPet = await petService.create(formData);

      if (newPet.error) {
        throw new Error(newPet.error);
      }
      // Add the pet object and the current petList to a new array, and
      // set that array as the new petList
      setPets([newPet, ...pets]);
      setIsFormOpen(false);
    } catch (error) {
        // Log the error to the console
        console.log(error);
    }
  };

  const handleUpdatePet = async (formData, petId) => {
    try {
      const updatedPet = await petService.update(formData, petId);
  
      // handle potential errors
      if (updatedPet.err) {
        throw new Error(updatedPet.err);
      }
  
      const updatedPetList = pets.map((pet) => (
        // If the _id of the current pet is not the same as the updated pet's _id,
        // return the existing pet.
        // If the _id's match, instead return the updated pet.
        pet._id !== updatedPet._id ? pet : updatedPet
      ));
      // Set pets state to this updated array
      setPets(updatedPetList);
      // If we don't set selected to the updated pet object, the details page will
      // reference outdated data until the page reloads.
      setSelected(updatedPet);
      setIsFormOpen(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeletePet = async (petId) => {
    try {
      const deletedPet = await petService.deletePet(petId);

      if (deletedPet.err) {
        throw new Error(deletedPet.err);
      }

      setPets(pets.filter((pet) => pet._id !== deletedPet._id));
      setSelected(null);
      setIsFormOpen(false);
    } catch (err) {
      console.log(err);
    }
  };

  
  return (
    <>
      <PetList pets={pets} handleSelect={handleSelect} handleFormView={handleFormView} isFormOpen={isFormOpen}/>
      {isFormOpen ? (
        <PetForm handleAddPet={handleAddPet} handleUpdatePet={handleUpdatePet} selected={selected}/>
      ) : (
        <PetDetail selected={selected} handleFormView={handleFormView} handleDeletePet={handleDeletePet}/>
      )}
    </>
  );
  
};

export default App;
