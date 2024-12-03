import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { AuthContext } from '../../../../context/context';
import axios from 'axios';
import '../CastandCrew/CastandCrew.css';
import { useParams } from 'react-router-dom';

function Casts() {
  const { auth } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [cast, setCast] = useState([]);
  const [castid, setCastId] = useState(undefined);
  const [selectedcast, setSelectedCast] = useState({});
  const [notfound, setNotFound] = useState(false);
  const searchRef = useRef();
  const nameRef = useRef();
  const characterNameRef = useRef();
  const urlRef = useRef();
  let { movieId } = useParams();

  // Fetching all casts for the movie
  const getAll = useCallback((movie_id) => {
    axios({
      method: 'get',
      url: `/movies/${movie_id}`,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${auth.accessToken}`,
      },
    })
      .then((response) => {
        setCast(response.data.casts);
      })
      .catch((error) => {
        console.error("Error fetching Casts:", error.response.data);
      });
  }, [auth.accessToken]);

  useEffect(() => {
    getAll(movieId);
  }, [movieId, getAll]);

  // Searching for a cast by name
  const handleSearchPerson = useCallback(async (page = 1) => {
    setNotFound(true);
    try {
      if (!query) return; // Return early if no query is provided.

      const response = await axios({
        method: 'get',
        url: `https://api.themoviedb.org/3/search/person?query=${query}&include_adult=false&language=en-US&page=${page}`,
      });

      const data = response.data.results;
      if (data.length === 0) {
        setNotFound(true);
        return;
      }

      setSelectedCast(data[0]);
      setNotFound(false);
    } catch (error) {
      console.error('Error searching for person:', error.response?.data || error.message);
      setNotFound(true);
    }
  }, [query]);

  // Save new cast to the database
  const handlesave = async () => {
    if (!characterNameRef.current.value.trim()) {
      characterNameRef.current.style.border = '2px solid red';
      setTimeout(() => {
        characterNameRef.current.style.border = '1px solid #ccc';
      }, 2000);
      return;
    }

    try {
      const datacast = {
        userId: auth.user.userId,
        movieId: movieId,
        name: selectedcast.name,
        url: `https://image.tmdb.org/t/p/original/${selectedcast.profile_path}`,
        characterName: characterNameRef.current.value,
      };

      console.log("Data to be sent:", datacast);

      const response = await axios({
        method: 'POST',
        url: '/admin/casts',
        data: datacast,
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });

      console.log("Server response:", response.data);

      alert('Added Successfully');
      setSelectedCast({});
      handleClearInput();
      getAll(movieId);
    } catch (error) {
      console.error("Error saving data:", error.response?.data || error.message);
      alert("Nothing to Save. Data is Empty...");
    }
  };

  // Fetch cast details for editing
  const castget = async (id) => {
    axios({
      method: 'get',
      url: `/casts/${id}`,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${auth.accessToken}`,
      },
    })
      .then((response) => {
        setSelectedCast(response.data);
        setCastId(response.data.id);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Validate the input fields
  const validateField = (fieldRef, fieldName) => {
    if (!fieldRef.current.value.trim()) {
      fieldRef.current.style.border = '2px solid red';
      setTimeout(() => {
        fieldRef.current.style.border = '1px solid #ccc';
      }, 2000);
      console.log(`${fieldName} cannot be empty.`);
      return false;
    }
    return true;
  };

  // Update existing cast information
  const castupdate = async (id) => {
    if (!selectedcast?.id) {
      alert("No cast selected to update.");
      return;
    }

    const validateFields = () => {
      switch (true) {
        case !validateField(nameRef, "Name"):
          return false;
        case !validateField(characterNameRef, "Character Name"):
          return false;
        case !validateField(urlRef, "URL"):
          return false;
        default:
          return true;
      }
    };

    if (!validateFields()) {
      return;
    } else {
      const isConfirm = window.confirm("Are you sure you want to update the cast?");
      if (isConfirm) {
        const datacast = {
          id: selectedcast.id,
          userId: selectedcast.userId,
          name: selectedcast.name,
          url: selectedcast.url,
          characterName: selectedcast.characterName,
        };

        console.table(datacast);
        try {
          const response = await axios({
            method: 'patch',
            url: `/casts/${id}`,
            data: datacast,
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${auth.accessToken}`,
            },
          });
          alert('Updated Successfully!');
          console.log(response.message);
          handleClear();
          getAll(movieId);
        } catch (error) {
          console.error("Error updating cast:", error.response?.data || error.message);
        }
      }
    }
  };

  // Clear selected cast and ID
  const handleClear = useCallback(() => {
    setSelectedCast({});
    setCastId(undefined);
  }, []);

  // Clear the input fields
  const handleClearInput = () => {
    setQuery("");
    setSelectedCast({});
  };

  // Delete a cast from the database
  const handledelete = (id) => {
    const isConfirm = window.confirm("Are you Sure to Delete Cast?");

    if (isConfirm) {
      axios({
        method: 'delete',
        url: `/admin/casts/${id}`,
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      })
        .then(() => {
          console.log("Database Updated");
          getAll(movieId);
          alert("Deleted Successfully!");
        })
        .catch((error) => {
          console.error(error);
          alert("Error deleting cast");
        });
    }
  };

  return (
    <div className='cNc-cast-box'>
      {/* Search Box and Selected Cast Details */}
      <div className='cNc-Search-Box'>
        <div className='cNc-parent-container'>
          <div className='cNc-search-box-btn'>
            <input
              className='cNc-input-search-person'
              type='text'
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedCast({});
              }}
              placeholder='Search cast name'
              ref={searchRef}
            />
            <button
              className='cNc-button-search'
              type='button'
              onClick={() => handleSearchPerson(1)}
              disabled={notfound}
            >
              {notfound ? 'Searching...' : 'Search'}
            </button>
            <button
              className='cNc-save-button'
              type='button'
              onClick={handlesave}
              disabled={!selectedcast}
            >
              Add Cast
            </button>
          </div>
        </div>

        {/* Selected Cast Details */}
        {selectedcast && Object.keys(selectedcast).length > 0 && (
          <div className='cNc-cast-detail-box'>
            <div className='cNc-image-container-center'>
              <div className='cNc-image-container'>
                <img
                  alt='image-cast'
                  src={selectedcast?.profile_path
                    ? `https://image.tmdb.org/t/p/original/${selectedcast.profile_path}`
                    : selectedcast?.url
                  }
                  className='cNc-img-cast'
                />
              </div>
            </div>
            <div className='cNc-info-text'>
              <div className='cNc-input-group'>
                <label className='cNc-cast-n'>Cast Name:</label>
                <input
                  className='cNc-cast-name'
                  value={selectedcast.name || ''}
                  onChange={(e) => setSelectedCast({ ...selectedcast, name: e.target.value })}
                  disabled={castid === undefined}
                  ref={nameRef}
                />
              </div>
              <div className='cNc-input-group'>
                <label className='cNc-character-n'>Character Name:</label>
                <input
                  className='cNc-character-name'
                  value={selectedcast.characterName || ''}
                  onChange={(e) => setSelectedCast({ ...selectedcast, characterName: e.target.value })}
                  ref={characterNameRef}
                />
              </div>
              <div className='cNc-input-group'>
                <label className='cNc-url-text'>Url:</label>
                <input
                  className='cNc-url-text-photo'
                  value={selectedcast.profile_path || selectedcast.url || ''}
                  onChange={(e) => setSelectedCast({ ...selectedcast, url: e.target.value })}
                  disabled={castid === undefined}
                  ref={urlRef}
                />
              </div>
            </div>
            {castid !== undefined && (
              <div className='cNc-edit-back-btn'>
                <button
                  className='cNc-edit-btn'
                  type='button'
                  onClick={() => castupdate(selectedcast.id)}
                >
                  Update
                </button>
                <button
                  className='cNc-back-btn'
                  type='button'
                  onClick={handleClear}
                >
                  Back
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cast List */}
      <div className='cNc-Cast-View-Box'>
        {cast && cast.length > 0 ? (
          <div className='cNc-card-display-cast'>
            <div className="cNc-card-wrapper">
              {cast.map((actor) => (
                <div key={actor.id} className="cNc-card">
                  <div className='cNc-buttons-group'>
                    <button
                      type='button'
                      className='cNc-delete-button'
                      onClick={() => handledelete(actor.id)}
                    >
                      DELETE
                    </button>
                    <button
                      type='button'
                      className='cNc-edit-button'
                      onClick={() => castget(actor.id)}
                    >
                      EDIT
                    </button>
                  </div>
                  <img src={actor.url} alt={actor.name} style={{ width: 'auto' }} className='cNc-image-casts' />
                  <div className="cNc-container">
                    <h4><b>{actor.name}</b></h4>
                    <p>{actor.characterName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='cNc-no-cast'>
            <h3>No Cast Uploaded</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default Casts;