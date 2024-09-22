import { useContext, useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import axios from "axios";
import { URL } from "../url";
import { UserContext } from "../context/UserContext";
import { useNavigate, useParams, Link } from "react-router-dom";

// Utility function to strip HTML tags
const stripHtml = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

const Profile = () => {
  const { id: paramId } = useParams();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [updated, setUpdated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch profile data
  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${URL}/api/users/${user._id}`);
      setUsername(res.data.username);
      setEmail(res.data.email);
      setPassword(res.data.password);
    } catch (err) {
      setError("Failed to fetch profile data.");
    } finally {
      setLoading(false);
    }
  };

  // Handle user update
  const handleUserUpdate = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.put(
        `${URL}/api/users/${user._id}`,
        { username, email, password },
        { withCredentials: true }
      );
      setUpdated(true);
    } catch (err) {
      setError("Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  // Handle user delete
  const handleUserDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.delete(`${URL}/api/users/${user._id}`, {
        withCredentials: true,
      });
      setUser(null);
      navigate("/");
    } catch (err) {
      setError("Failed to delete user.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user posts
  const fetchUserPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${URL}/api/posts/user/${user._id}`);
      setPosts(res.data);
    } catch (err) {
      setError("Failed to fetch user posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [paramId]);

  return (
    <div>
      <Navbar />
      <div className="min-h-screen px-6 md:px-16 mt-8 flex flex-col md:flex-row gap-8">
        {/* User Posts Section */}
        <div className="flex flex-col w-full md:w-2/3 space-y-6">
          <h1 className="text-2xl font-bold mb-4">Your Posts</h1>
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : posts.length ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {posts.map((post) => (
                <Link
                  to={`/posts/post/${post._id}`}
                  key={post._id}
                  className="block"
                >
                  <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-300 max-w-sm mx-auto transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                    {/* Image Section */}
                    {post.photo && (
                      <div className="w-full h-[180px]">
                        <img
                          src={`${URL}/images/${post.photo}`}
                          alt={post.title}
                          className="h-full w-full object-cover rounded-t-2xl transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                    )}

                    {/* Content Section */}
                    <div className="p-4">
                      <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
                      <p className="text-sm text-gray-600 mb-4">
                        {stripHtml(post.desc).length > 100
                          ? `${stripHtml(post.desc).slice(0, 100)}...`
                          : stripHtml(post.desc)}
                      </p>

                      <div className="flex items-center justify-between">
                        {/* Date */}
                        <p className="text-sm text-gray-500">
                          {new Date(post.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No posts found.</div>
          )}
        </div>

        {/* User Profile Section */}
        <div className="flex flex-col w-full md:w-1/3 space-y-6">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <input
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            className="px-4 py-2 border border-gray-300 rounded-md w-full"
            placeholder="Your username"
            type="text"
          />
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="px-4 py-2 border border-gray-300 rounded-md w-full"
            placeholder="Your email"
            type="email"
          />
          <div className="flex flex-col space-y-4 mt-6">
            <button
              onClick={handleUserUpdate}
              className="bg-black text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700"
            >
              {loading ? "Updating..." : "Update"}
            </button>
            <button
              onClick={handleUserDelete}
              className="bg-red-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-600"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
          {updated && (
            <div className="text-green-500 text-center">
              User Updated Successfully!
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
