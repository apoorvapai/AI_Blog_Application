import { useContext, useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { ImCross } from "react-icons/im";
import axios from "axios";
import { URL } from "../url";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditPost = () => {
  const { id: postId } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [cat, setCat] = useState("");
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch post data
  const fetchPost = async () => {
    try {
      const res = await axios.get(`${URL}/api/posts/${postId}`);
      setTitle(res.data.title);
      setDesc(res.data.desc);
      setCats(res.data.categories);
      if (res.data.photo) {
        setImagePreview(`${URL}/images/${res.data.photo}`);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch post data.");
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const deleteCategory = (i) => {
    let updatedCats = [...cats];
    updatedCats.splice(i, 1);
    setCats(updatedCats);
  };

  const addCategory = () => {
    if (cat.trim()) {
      let updatedCats = [...cats];
      updatedCats.push(cat);
      setCat("");
      setCats(updatedCats);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const post = {
      title,
      desc,
      username: user.username,
      userId: user._id,
      categories: cats,
    };

    if (file) {
      const data = new FormData();
      const filename = Date.now() + file.name;
      data.append("img", filename);
      data.append("file", file);
      post.photo = filename;
      try {
        await axios.post(URL + "/api/upload", data);
      } catch (err) {
        console.log(err);
      }
    }

    try {
      const res = await axios.put(URL + "/api/posts/" + postId, post, { withCredentials: true });
      navigate("/posts/post/" + res.data._id);
    } catch (err) {
      console.log(err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className='bg-gray-50 min-h-screen'>
      <Navbar />
      <div className='px-6 md:px-[200px] mt-4'>
        <h1 className='font-bold md:text-3xl text-2xl mb-4 text-gray-800'>Edit Post</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        
        <form className='w-full flex flex-col space-y-6 md:space-y-8'>
          <div className='flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8'>
            <div className='flex-1'>
              <label className='font-semibold mb-2'>Title</label>
              <input 
                onChange={(e) => setTitle(e.target.value)} 
                value={title}
                type="text" 
                placeholder='Enter post title' 
                className='px-4 py-3 bg-gray-50 outline-none border border-gray-300 rounded-lg w-full mb-4 shadow-sm focus:ring-2 focus:ring-blue-500'
              />
              
              <label className='font-semibold mb-2'>Upload Image</label>
              <input 
                onChange={handleImageChange} 
                type="file"  
                className='px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg w-full mb-4 shadow-sm focus:ring-2 focus:ring-blue-500'
              />

              <label className='font-semibold mb-2'>Categories</label>
              <div className='flex flex-col'>
                <div className='flex items-center space-x-4'>
                  <input 
                    value={cat} 
                    onChange={(e) => setCat(e.target.value)} 
                    className='px-4 py-3 bg-gray-50 outline-none border border-gray-300 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-500' 
                    placeholder='Enter post category' 
                    type="text"
                  />
                  <div 
                    onClick={addCategory} 
                    className='bg-black text-white hover:bg-gray-800 transition duration-300 px-4 py-2 font-semibold cursor-pointer rounded-lg shadow-lg'
                  >
                    Add
                  </div>
                </div>

                <div className='flex px-4 mt-3 flex-wrap'>
                  {cats?.map((c, i) => (
                    <div key={i} className='flex items-center space-x-2 mr-4 bg-gray-200 px-2 py-1 rounded-lg'>
                      <p>{c}</p>
                      <p 
                        onClick={() => deleteCategory(i)} 
                        className='text-white bg-black rounded-full cursor-pointer p-1 text-sm'
                      >
                        <ImCross />
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <label className='font-semibold mb-2'>Description</label>
              <ReactQuill 
                value={desc} 
                onChange={setDesc} 
                className='border border-gray-300 rounded-lg h-[300px] w-full mb-8 shadow-sm' 
                placeholder='Enter post description'
              />
            </div>

            <div className='flex-1 border border-gray-300 rounded-lg p-4'>
              {imagePreview ? (
                <div className='flex items-center justify-center h-full'>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className='w-full h-auto max-h-[400px] object-contain rounded-lg'
                  />
                </div>
              ) : (
                <div className='flex items-center justify-center h-full text-gray-500'>
                  No Image Selected
                </div>
              )}
            </div>
          </div>

          <div className='flex space-x-4'>
            <button 
              onClick={handleUpdate} 
              className='bg-black w-full md:w-[20%] mx-auto text-white font-semibold px-4 py-3 md:text-xl text-lg rounded-lg shadow-lg hover:bg-gray-800 transition duration-300'
            >
              Update
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditPost;
