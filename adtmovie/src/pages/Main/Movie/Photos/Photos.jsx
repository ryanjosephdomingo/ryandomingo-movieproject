import React, { useEffect, useState, useContext, useCallback, useRef } from 'react'
import { AuthContext } from "../../../../../src/context/context";
import './Photos.css'
import axios from 'axios'
import { useParams } from 'react-router-dom';

function Photos() {
  const { auth } = useContext(AuthContext);
  const [photoid, setPhotoId] = useState(undefined);
  const urlRef = useRef();
  const descriptionRef = useRef();
  const [photos, setPhotos] = useState([]);
  const [selectedphoto, setSelectedPhoto] = useState({});
  let { movieId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state


  const getAll = useCallback((movieId) => {
    axios({
      method: 'get',
      url: `/movies/${movieId}`,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${auth.accessToken}`,
      },
    })
      .then((response) => {
        setPhotos(response.data.photos);
      })
      .catch((error) => {
        console.error("Error fetching Photos:", error.response.data);
      });
  }, [auth.accessToken])

  useEffect(() => {
    getAll(movieId);
  }, [movieId, getAll]);

  const openModal = (photo) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };


  //This used for Importing Photos based on tmdbId from Movie
  function importDataPhoto() {
    axios({
      method: 'get',
      url: `https://api.themoviedb.org/3/movie/${movieId}/images`,
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiOThlZTRmYzQ1MzI5MWQ3YzE2M2JlNjQxYjZlODlhMiIsIm5iZiI6MTczMjcyNTY1MS42ODgsInN1YiI6IjY3NDc0YjkzMDI2NjgyYjkyZWIwN2NiMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.desO1R3Cr179L65yp-yno4KXHdfOeBKIUmuEpVRc-Qk', // Make sure to replace this with your actual API key
      },
    }).then((response) => {
      setSavePhotosImp(response.data.backdrops);
      alert(`Total of ${response.data.backdrops.length} Photos are now Imported to Database`);
      setTimeout(() => {
        getAll(movieId);
      }, 2000);
    })
  }

  //Saving all Photo Imported to Database
  async function setSavePhotosImp(photoImportData) {
    await Promise.all(photoImportData.map(async (datainfo) => {
      const dataphoto = {
        userId: auth.user.userId,
        movieId: movieId,
        description: `Photos`,
        url: `https://image.tmdb.org/t/p/w500/${datainfo.file_path}`,
      };
      console.log('Transfering import to Database', dataphoto);
      try {
        await axios.post('/admin/photos', dataphoto, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });
      } catch (error) {
        console.error('Error of Importing:', error);
      }
    }));
    console.log('Imported Success');
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
  }

  

  const handlesave = async () => {

    const validateFields = () => {
      const isUrlValid = validateField(urlRef, "URL");
      const isDescriptionValid = validateField(descriptionRef, "Description");

      return isUrlValid && isDescriptionValid;
    };

    if (!validateFields()) {
      return; // This is for stop if any valid is null
    } else {
      try {
        const dataphoto = {
          userId: auth.user.userId,
          movieId: movieId,
          url: selectedphoto.url,
          description: selectedphoto.description,
        }
        await axios({
          method: 'POST',
          url: '/admin/photos',
          data: dataphoto,
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          }
        });
        alert('Added Success');
        setSelectedPhoto([])
        getAll(movieId);
      } catch (error) {
        console.log("Error Saving Photo", error.response?.data || error.message);
      }
    }
  }

  const handledelete = (id) => {
    const isConfirm = window.confirm("Are you Sure to Delete this Photo?");

    if (isConfirm) {
      axios({
        method: 'delete',
        url: `/photos/${id}`,
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      }).then(() => {
        alert("Delete Success");
        getAll(movieId);
        console.log("Database Updated");
      }).catch((err) => {
        console.log("err");
      });
    }
  };

  const photofetch = async (id) => {
    axios({
      method: 'get',
      url: `/photos/${id}`,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${auth.accessToken}`,
      },
    })
      .then((response) => {
        setSelectedPhoto(response.data);
        setPhotoId(response.data.id)
      })
      .catch((error) => {
        console.log(error)
      });
  }

  const photoUpdate = async (id) => {
    const validateFields = () => {
      const isUrlValid = validateField(urlRef, "URL");
      const isDescriptionValid = validateField(descriptionRef, "Description");

      return isUrlValid && isDescriptionValid;
    };

    if (!validateFields()) {
      return; // This is for stop if any valid is null
    } else {
      const isConfirm = window.confirm("Are you sure you want to update the Photo?");
      if (isConfirm) {
        const dataphoto = {
          userId: auth.user.userId,
          movieId: selectedphoto.movieId,
          description: selectedphoto.description,
          url: selectedphoto.url,
        };

        console.table(dataphoto);
        try {
          const response = await axios({
            method: 'patch',
            url: `/photos/${id}`,
            data: dataphoto,
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${auth.accessToken}`,
            },
          });
          console.log(response.data);
          alert('updated successfully!')
          getAll(movieId)
        } catch (error) {
          console.log(error)
        }
      }
    }
  }

  return (
    <div className='photo-box'>
      <div className='photo-ViewBox'>
        {photos !== undefined && photos.length > 0 ? (
          <div className='photo-DisplayCard'>
            {photos.map((image) => (
              <div key={image.id} className='card-photo'>
                <div className='photo-ButtonsGroup'>
                  <button
                    type='button'
                    className='photo-DeleteButton'
                    onClick={() => handledelete(image.id)}
                  >
                    DELETE
                  </button>
                  <button
                    type='button'
                    className='photo-EditButton'
                    onClick={() => photofetch(image.id)}
                  >
                    EDIT
                  </button>
                </div>
                <img src={image.url} alt={image.description} style={{ width: '100%' }} className='image-style' 
                onClick={() => openModal(image)} // Open modal on click
                />
                <div className='photo-Container'>
                  <p>{image.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='no-photo'>
            <h3>Photos not Found</h3>
          </div>
        )}
      </div>

      {/* Modal for Full-Screen View */}
      {isModalOpen && (
        <div className='photo-ModalOverlay' onClick={closeModal}>
          <div className='photo-ModalContent' onClick={(e) => e.stopPropagation()}>
          <button className='photo-CloseModal' onClick={closeModal}>
          </button>
            <img src={selectedphoto.url} alt={selectedphoto.description} className='modal-image' />
            <p className='photo-ModalDescription'>{selectedphoto.description}</p>
          </div>
        </div>
      )}
      
      
      <div className='photo-SearchBox'>
        <div className='photo-ParentContainer'>
          <div className='photo-DetailBox'>
            <div className='photo-ContainerCenter'>
              <div className='photo-ImageContainer'>
                <img
                  alt='photo-movies'
                  src={selectedphoto.url
                    ? selectedphoto.url
                    : 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'
                  }
                  className='photo-img'
                />
              </div>
            </div>
          </div>
          <div className='photo-InfoText'>
            <div className='photo-InputGroup'>
              <label className='photo-Label'>
                Url Image:
              </label>
              <input
                className='photo-Url'
                value={selectedphoto.url || ''}
                onChange={(e) => setSelectedPhoto({ ...selectedphoto, url: e.target.value })}
                ref={urlRef}
              />
            </div>
            <div className='photo-InputGroup'>
              <label className='photo-Label'>
                Description:
              </label>
              <textarea
                className='photo-Description'
                value={selectedphoto.description || ''}
                onChange={(e) => setSelectedPhoto({ ...selectedphoto, description: e.target.value })}
                ref={descriptionRef}
              />
            </div>
          </div>
          <div className='save-edit-back-btn'>
            {!photoid ? (
              <>
                <button className='photo-EditSaveBtn'
                  type='button'
                  onClick={handlesave}
                >
                  Save
                </button>
                <div>
                  <button
                    className='photo-ImportButton'
                    type='import-photos-button'
                    onClick={importDataPhoto}
                  >
                    Import All Photos
                  </button>
                </div>
              </>
            ) : (
              <>
                <button className='photo-SaveButton'
                  type='button'
                  onClick={() => photoUpdate(photoid)}
                >
                  Update
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default Photos