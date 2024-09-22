import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { URL } from '../url';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
import { REACT_APP_API_KEY } from "../url";
import { ImCross } from 'react-icons/im';

const GenerateBlog = () => {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [contentPrompt, setContentPrompt] = useState("");
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [cat, setCat] = useState("");
    const [cats, setCats] = useState([]);

    const formatGeneratedContent = (content) => {
        let formattedContent = content.replace(/## (.*?)(\n|$)/g, '<h2 style="margin-top: 20px; margin-bottom: 10px;">$1</h2>');
        formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedContent = formattedContent.replace(/([^\n]+)(\n|$)/g, '<p style="margin-bottom: 15px;">$1</p>');
        return formattedContent;
    }

    const generateBlogContent = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${REACT_APP_API_KEY}`,
                {
                    contents: [
                        {
                            parts: [
                                {
                                    text: contentPrompt
                                }
                            ]
                        }
                    ]
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            if (response.data && response.data.candidates && response.data.candidates.length > 0) {
                const generatedContent = response.data.candidates[0].content.parts
                    .map((part) => part.text)
                    .join("\n");
                
                const formattedContent = formatGeneratedContent(generatedContent);
                setDesc(formattedContent);
            } else {
                setDesc("No content generated.");
            }
        } catch (error) {
            console.error("Error generating blog:", error);
            setDesc("Error occurred while generating blog. Try giving a different prompt");
        } finally {
            setLoading(false);
        }
    }

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
    }

    const handleCreate = async (e) => {
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
            const res = await axios.post(URL + "/api/posts/create", post, { withCredentials: true });
            navigate("/posts/post/" + res.data._id);
        } catch (err) {
            console.log(err);
        }
    }

    const addCategory = (e) => {
        e.preventDefault(); // Prevent default form submission
        if (cat.trim()) {
            setCats((prevCats) => [...prevCats, cat]);
            setCat("");
        }
    };

    const deleteCategory = (i) => {
        setCats((prevCats) => prevCats.filter((_, index) => index !== i));
    };

    return (
        <div className='bg-gray-50 min-h-screen'>
            <Navbar />
            <div className='px-6 md:px-[200px] mt-4'>
                <h1 className='font-bold md:text-3xl text-2xl mb-4 text-gray-800'>Generate Blog</h1>
                <p>Transform your ideas into an engaging blog post with Gemini AI!</p>
                <p>Just provide your blog title and a prompt, and watch as it crafts your thoughts into a captivating story.</p>
                <p>Ready to bring your vision to life? Let’s get started!</p>
                <form className='w-full flex flex-col space-y-8'>
                    <div className='flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8'>
                        <div className='flex-1 space-y-6'>
                            <div>
                                <label className='font-semibold block mb-2 mt-2'>Blog Title</label>
                                <input 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    type="text" 
                                    value={title}
                                    placeholder='Enter blog title' 
                                    className='px-4 py-3 bg-gray-50 outline-none border border-gray-300 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-500'
                                />
                            </div>

                            <div>
                                <label className='font-semibold block mb-2'>Content Generation Prompt</label>
                                <div className='flex items-center space-x-4'>
                                    <input 
                                        onChange={(e) => setContentPrompt(e.target.value)} 
                                        type="text" 
                                        value={contentPrompt}
                                        placeholder='Enter prompt for content generation' 
                                        className='px-4 py-3 bg-gray-50 outline-none border border-gray-300 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-500'
                                    />
                                    <button 
                                        onClick={generateBlogContent} 
                                        type='button' 
                                        className='bg-black text-white px-4 py-2 font-semibold cursor-pointer rounded-md'
                                        disabled={loading}
                                    >
                                        {loading ? "Generating..." : "Generate Blog"}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className='font-semibold block mb-2'>Categories</label>
                                <div className='flex flex-col'>
                                    <div className='flex items-center space-x-4'>
                                        <input 
                                            value={cat} 
                                            onChange={(e) => setCat(e.target.value)} 
                                            className='px-4 py-3 bg-gray-50 outline-none border border-gray-300 rounded-lg w-full shadow-sm'
                                            placeholder='Enter category' 
                                            type="text"
                                        />
                                        <button 
                                            onClick={addCategory} 
                                            type='button' // Ensure this button does not submit the form
                                            className='bg-black text-white px-4 py-2 font-semibold cursor-pointer rounded-md'
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className='flex px-4 mt-3 flex-wrap'>
                                        {cats.map((c, i) => (
                                            <div key={i} className='flex items-center space-x-2 mr-4 bg-gray-200 px-2 py-1 rounded-md'>
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
                            </div>

                            <div>
                                <label className='font-semibold block mb-2'>Upload Image</label>
                                <input 
                                    onChange={handleImageChange} 
                                    type="file"  
                                    className='px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-500'
                                />
                            </div>

                            <div>
                                <label className='font-semibold block mb-2'>Generated Blog Content (Editable)</label>
                                <ReactQuill 
                                    value={desc} 
                                    onChange={setDesc} 
                                    className='border border-gray-300 rounded-lg h-[300px] w-full mb-4 shadow-sm' 
                                    placeholder='Blog content will appear here'
                                />
                            </div>
                        </div>

                        {/* Image Preview Section */}
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

                    <button 
                        onClick={handleCreate} 
                        className='bg-black w-full md:w-[20%] mx-auto text-white font-semibold px-4 py-3 md:text-xl text-lg rounded-lg shadow-lg hover:bg-gray-800 transition duration-300'
                    >
                        Create Blog Post
                    </button>
                </form>
            </div>
            <Footer />
        </div>
    );
}

export default GenerateBlog;
