import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { AuthContext } from '../../../../context/context';

import axios from 'axios';
import './Cast.css';
import { useParams } from 'react-router-dom';

function Casts() {
  const { auth } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [cast, setCast] = useState([]);
  const [castid, setCastId] = useState(undefined);
  const [selectedcast, setSelectedCast] = useState({})
  const searchRef = useRef();
  const [notfound, setNotFound] = useState(false);
  const nameRef = useRef();
  const characterNameRef = useRef()
  const urlRef = useRef();
  let { movieId } = useParams();

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
  }, [auth.accessToken]) 

  useEffect(() => {
    getAll(movieId);
  }, [movieId, getAll]); 


  
  function importDataCast() {
    axios({
      method: 'get',
      url: `https://api.themoviedb.org/3/movie/${movieId}/credits?language=en-US`,
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiOThlZTRmYzQ1MzI5MWQ3YzE2M2JlNjQxYjZlODlhMiIsIm5iZiI6MTczMjcyNTY1MS42ODgsInN1YiI6IjY3NDc0YjkzMDI2NjgyYjkyZWIwN2NiMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.desO1R3Cr179L65yp-yno4KXHdfOeBKIUmuEpVRc-Qk', // Make sure to replace this with your actual API key
      },
    }).then((response) => {
      setSaveCastsImp(response.data.cast);
      alert(`Total of ${response.data.cast.length} Casts are now Imported to Database`);
      setTimeout(() => {
        getAll(movieId);
      }, 2000);
    })
  }

  
  async function setSaveCastsImp(castImportData) {
    await Promise.all(
      castImportData.map(async (datainfo) => {
        const datacast = {
          userId: auth.user.userId,
          movieId: movieId,
          name: datainfo.name,
          characterName: datainfo.character,
          url: datainfo.profile_path
            ? `https://image.tmdb.org/t/p/w500/${datainfo.profile_path}`
            : require('../../../../../src/pages/Main/Movie/Cast/NO CAST.png'), 
        };
        console.log('Transferring import to Database', datacast);
        try {
          await axios.post('/admin/casts', datacast, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${auth.accessToken}`,
            },
          });
        } catch (error) {
          console.error('Error Importing:', error);
        }
      })
    );
    console.log('Import Cast Success');
  }


  const handleSearchPerson = useCallback(async (page = 1) => {
    setNotFound(true);
    try {
      if (!query || query.trim() === '') {
        searchRef.current.style.border = '2px solid red';
        console.log("Input is empty or undefined");
        setTimeout(() => {
          searchRef.current.style.border = '1px solid #ccc';
          setNotFound(false);
        }, 2000);
        return;
      }
      const response = await axios({
        method: 'get',
        url: `https://api.themoviedb.org/3/search/person?query=${query}&include_adult=false&language=en-US&page=${page}`,
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiOThlZTRmYzQ1MzI5MWQ3YzE2M2JlNjQxYjZlODlhMiIsIm5iZiI6MTczMjcyNTY1MS42ODgsInN1YiI6IjY3NDc0YjkzMDI2NjgyYjkyZWIwN2NiMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.desO1R3Cr179L65yp-yno4KXHdfOeBKIUmuEpVRc-Qk'
        },
      });

      if (response.data.results.lenght === 0) {
        console.log("Not Found");
        setSelectedCast([])
      } else {
        setNotFound(false);
        setSelectedCast(response.data.results[0]);
        console.log(response.data.results);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  }, [query])

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
        characterName: selectedcast.characterName,
      }
      await axios({
        method: 'POST',
        url: '/admin/casts',
        data: datacast,
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        }
      });
      alert('Added Success');
      setSelectedCast({});
      handleClearInput();
      getAll(movieId);
    } catch (error) {
      alert("Nothing to Save. Data is Empty...")
      console.log(error);
    }
  }

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
        setCastId(response.data.id)
      })
      .catch((error) => {
        console.log(error)
      });
  }

  const validateField = (fieldRef, fieldName) => {
    if (!fieldRef.current.value.trim()) {
      fieldRef.current.style.border = '2px solid red';
      setTimeout(() => {
        fieldRef.current.style.border = '1px solid #ccc';
      }, 2000);
      console.log(`${fieldName} cannot be empty.`)
      return false;
    }
    return true;
  };

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
          alert('updated Successfully!');
          console.log(response.message);
          handleclear();
          getAll(movieId)
        } catch (error) {
          console.error("Error updating cast:", error.response?.data || error.message);
        }
      }
    }
  };

  const handleclear = useCallback(() => {
    setSelectedCast([]);
    setCastId(undefined);
  }, [setSelectedCast, setCastId]);

  const handleClearInput = () => {
    setQuery("");
    setSelectedCast({});
  };

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
        })
        .catch((error) => {
          console.error(error);
          getAll(movieId);
          alert("Delete Success!");
        });
    }
  };

  return (
    <div className='cast-box'>
      { }
      <div className='cast-SearchBox'>
        <div className='cast-ParentContainer'>
          <div className='cast-SearchBoxBtn'>
            <input
              className='cast-search-person'
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
              className='cast-SearchButton'
              type='button'
              onClick={() => handleSearchPerson(1)}
              disabled={notfound}
            >
              {notfound ? 'Searching...' : 'Search'}
            </button>
            <button
              className='cast-SaveButton'
              type='button'
              onClick={handlesave}
              disabled={!selectedcast}
            >
              Add Cast
            </button>
          </div>
          <div>
                <button
                  className='cast-ImportButton'
                  type='button'
                  onClick={importDataCast}
                >
                  Import All Casts
                </button>
              </div>
        </div>
        { }
          <div className='cast-DetailBox'>
            <div className='cast-ImageContainer-center'>
              <div className='cast-ImageContainer'>
                <img
                  alt='image-cast'
                  src={selectedcast?.profile_path
                    ? `https://image.tmdb.org/t/p/original/${selectedcast.profile_path}`
                    : selectedcast?.url
                    ? selectedcast.url
                      : require('../../Movie/Cast/NO CAST.png')
                  }
                  className='cast-Image'
                />
              </div>
            </div>
            <div className='cast-TextInfo'>
              <div className='cast-InputGroup'>
                <label className='cast-n'>Cast Name:</label>
                <input
                  className='cast-Name'
                  value={selectedcast.name || ''}
                  onChange={(e) => setSelectedCast({ ...selectedcast, name: e.target.value })}
                  disabled={castid === undefined}
                  ref={nameRef}
                />
              </div>
              <div className='cast-InputGroup'>
                <label className='cast-Character-n'>Character Name:</label>
                <input
                  className='cast-CharacterName'
                  value={selectedcast.characterName || ''}
                  onChange={(e) => setSelectedCast({ ...selectedcast, characterName: e.target.value })}
                  ref={characterNameRef}
                />
              </div>
              <div className='cast-InputGroup'>
                <label className='cast-TextUrl'>Url:</label>
                <input
                  className='cast-url-text-photo'
                  value={selectedcast.profile_path || '' || selectedcast.url || ''}
                  onChange={(e) => setSelectedCast({ ...selectedcast, url: e.target.value })}
                  disabled={castid === undefined}
                  ref={urlRef}
                />
              </div>
            </div>
            {castid !== undefined && (
              <div className='cast-EditBackBtn'>
                <button
                  className='cast-EditButton'
                  type='button'
                  onClick={() => castupdate(selectedcast.id)}
                >
                  Update
                </button>
                <button
                  className='cast-BackButton'
                  type='button'
                  onClick={handleclear}
                >
                  Back
                </button>
              </div>
            )}
          </div>
      </div>
  
      { }
      <div className='cast-ViewBox'>
        {cast !== undefined && cast.length > 0 ? (
          <div className='cast-CardDisplay'>
            <div className="cast-CardWrapper">
              {cast.map((actor) => (
                <div key={actor.id} className="cast-Card">
                  <div className='cast-ButtonGroup'>
                    <button
                      type='button'
                      className='cast-DeleteButton'
                      onClick={() => handledelete(actor.id)}
                    >
                      DELETE
                    </button>
                    <button
                      type='button'
                      className='cast-EditButton'
                      onClick={() => castget(actor.id)}
                    >
                      EDIT
                    </button>
                  </div>
                  <img src={actor.url} alt={actor.name} style={{ width: 'auto' }} className='cast-Image' />
                  <div className="cast-Container">
                    <h4><b>{actor.name}</b></h4>
                    <p>{actor.characterName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='cast-NoCast'>
            <h3>No Cast Uploaded</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default Casts;
