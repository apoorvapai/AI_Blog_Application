import { useNavigate, useParams } from "react-router-dom";
import Comment from "../components/Comment";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { BiEdit } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { URL, IF } from "../url";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import Loader from "../components/Loader";
import parse, { domToReact } from 'html-react-parser';
import DOMPurify from 'dompurify';

const PostDetails = () => {
  const postId = useParams().id;
  const [post, setPost] = useState({});
  const { user } = useContext(UserContext);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();

  const fetchPost = async () => {
    try {
      const res = await axios.get(`${URL}/api/posts/${postId}`);
      setPost(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeletePost = async () => {
    try {
      await axios.delete(`${URL}/api/posts/${postId}`, { withCredentials: true });
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPostComments = async () => {
    setLoader(true);
    try {
      const res = await axios.get(`${URL}/api/comments/post/${postId}`);
      setComments(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchPostComments();
  }, [postId]);

  const postComment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${URL}/api/comments/create`,
        {
          comment,
          author: user.username,
          postId,
          userId: user._id,
        },
        { withCredentials: true }
      );
      fetchPostComments();
    } catch (err) {
      console.log(err);
    }
  };

  const sanitizedDesc = DOMPurify.sanitize(post.desc);

  const renderContent = (htmlString) => {
    return parse(htmlString, {
      replace: (domNode) => {
        if (domNode.name === 'h2') {
          return <h2 style={{ fontWeight: 'bold', margin: '20px 0', fontSize: '1.5em' }}>{domToReact(domNode.children)}</h2>;
        }
        if (domNode.name === 'p') {
          return <p style={{ margin: '15px 0', lineHeight: '1.6' }}>{domToReact(domNode.children)}</p>;
        }
        if (domNode.name === 'ul') {
          return <ul style={{ margin: '15px 0', paddingLeft: '20px' }}>{domToReact(domNode.children)}</ul>;
        }
        if (domNode.name === 'li') {
          return <li style={{ marginBottom: '10px' }}>{domToReact(domNode.children)}</li>;
        }
        if (domNode.name === 'strong') {
          return <strong style={{ fontWeight: 'bold' }}>{domToReact(domNode.children)}</strong>;
        }
        return domNode;
      },
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      {loader ? (
        <div className="h-[80vh] flex justify-center items-center w-full">
          <Loader />
        </div>
      ) : (
        <div className="container mx-auto px-4 md:px-10 mt-8">
          {/* Post Title and Edit/Delete Icons */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{post.title}</h1>
            {user?._id === post?.userId && (
              <div className="flex items-center space-x-2">
                <p
                  className="cursor-pointer text-blue-500 hover:text-blue-700 transition"
                  onClick={() => navigate(`/edit/${postId}`)}
                >
                  <BiEdit size={24} />
                </p>
                <p
                  className="cursor-pointer text-red-500 hover:text-red-700 transition"
                  onClick={handleDeletePost}
                >
                  <MdDelete size={24} />
                </p>
              </div>
            )}
          </div>

          {/* Author and Date */}
          <div className="flex items-center justify-between mt-2 mb-6 text-gray-600">
            <p className="text-lg font-medium">@{post.username}</p>
            <div className="flex space-x-2">
              <p>{new Date(post.updatedAt).toLocaleDateString()}</p>
              <p>{new Date(post.updatedAt).toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Post Image */}
          <div className="flex justify-center mb-6">
            <img
              src={`${IF}${post.photo}`}
              className="max-w-[600px] w-[300px] h-auto rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
              alt=""
            />
          </div>

          {/* Post Description */}
          <div className="text-lg leading-relaxed text-justify mb-6">
            {renderContent(sanitizedDesc)}
          </div>

          {/* Post Categories */}
          <div className="flex items-center mt-4 space-x-4 font-semibold">
            <p>Categories:</p>
            {post.categories?.map((c, i) => (
              <span key={i} className="bg-gray-300 rounded-lg px-3 py-1">
                {c}
              </span>
            ))}
          </div>

          {/* Comments Section */}
          <div className="flex flex-col mt-8">
            <h3 className="mt-6 mb-4 font-semibold text-xl">Comments:</h3>
            {comments?.map((c) => (
              <Comment key={c._id} c={c} post={post} />
            ))}
          </div>

          {/* Write a Comment */}
          <div className="w-full flex flex-col mt-4 md:flex-row md:space-x-4">
            <input
              onChange={(e) => setComment(e.target.value)}
              type="text"
              placeholder="Write a comment"
              className="md:w-[80%] outline-none py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={postComment}
              className="bg-black text-white text-sm px-4 py-2 rounded-lg md:w-[20%] mt-4 md:mt-0 hover:bg-gray-800 transition"
            >
              Add Comment
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default PostDetails;
