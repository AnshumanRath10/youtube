import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Comments from "../../Components/Comments/Comments";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
// import vid from "../../Components/Video/vid.mp4";
import LikeWatchLaterSaveBtns from "./LikeWatchLaterSaveBtns";
import "./VideoPage.css";
import { addToHistory } from "../../actions/History";
import { viewVideo } from "../../actions/video";
function VideoPage() {
  const { vid } = useParams();
  // console.log(vid)

  // const chanels = useSelector((state) => state?.chanelReducers);

  // console.log(Cid)
  // const currentChanel = chanels.filter((c) => c._id === vid)[0];

  const vids = useSelector((state) => state.videoReducer);
  // console.log(vids)
  const vv = vids?.data.filter((q) => q._id === vid)[0];
  const dispatch = useDispatch();
  const CurrentUser = useSelector((state) => state?.currentUserReducer);

  const videoRef = useRef(null);
  const videoPaused = useRef(true);
  const [holding, setHolding] = useState(false);
  // const history = useHistory();
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  let clickTimeout = null;
  let holdTimeout = null;
  let clickCount = useRef(0);

  const handleHistory = () => {
    dispatch(
      addToHistory({
        videoId: vid,
        Viewer: CurrentUser?.result._id,
      })
    );
  };
  const handleViews = () => {
    dispatch(viewVideo({
      id: vid
    }))
  }
  useEffect(() => {
    if (CurrentUser) {
      handleHistory();
    }
    handleViews();
  }, []);

  const handleSingleTap = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = video.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    if (x > width * 0.7 && y < height * 0.3) {
      handleLocationPopup();
    } else {

      if (videoPaused.current) {
        videoPaused.current = false;
        video.play();
      } else {
        videoPaused.current = true;
        video.pause();
      }
    }
  };

  const handleDoubleTap = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = video.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x > width * 0.7) {
      video.currentTime += 10;
    } else if (x < width * 0.3) {
      video.currentTime -= 10;
    }
  };

  const handleTripleTap = (e) => {
    const rect = videoRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x > width * 0.7) {
      window.location.href = "/";
    } else if (x < width * 0.3) {
      // Show the comment section
      document.querySelector(".comments_VideoPage").scrollIntoView({ behavior: 'smooth' });
    } else {
      // Move to the next video (placeholder for actual implementation)
      alert("Move to the next video");
    }
  };

  const handleTap = (e) => {
    e.preventDefault();
    clickCount.current++;

    clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => {
      if (clickCount.current === 1) {
        handleSingleTap(e);
      } else if (clickCount.current === 2) {
        handleDoubleTap(e);
      } else if (clickCount.current === 3) {
        handleTripleTap(e);
      }
      clickCount.current = 0;
    }, 300);
  };

  const handleLocationPopup = async () => {
    alert("Location popup");
  };

  const handleHold = (e, rate) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
  };

  const handleMouseDown = (e) => {
    const rect = videoRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x > width * 0.7) {
      handleHold(e, 2);
    } else if (x < width * 0.3) {
      handleHold(e, 0.5);
    }

    holdTimeout = setTimeout(() => handleHold(e, 1), 3000); // Reset to normal speed after 3 seconds
  };

  const handleMouseUp = () => {
    clearTimeout(holdTimeout);
    handleHold(null, 1); // Reset to normal speed
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener("click", handleTap);
    video.addEventListener("mousedown", handleMouseDown);
    video.addEventListener("mouseup", handleMouseUp);

    return () => {
      video.removeEventListener("click", handleTap);
      video.removeEventListener("mousedown", handleMouseDown);
      video.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // useEffect(() => {
  //   const videoElement = videoRef.current;
  //   const controlsList = videoElement.getAttribute('controlsList');
  //   videoElement.setAttribute('controlsList', `${controlsList},customControl`);

  //   const controls = videoElement.controls;
  //   const customControl = document.createElement('button');
  //   customControl.innerHTML = 'Custom Control';

  //   customControl.addEventListener('click', () => {
  //     // Custom control functionality
  //     alert('Custom control clicked!');
  //   });

  //   videoElement.addEventListener('loadedmetadata', () => {
  //     const moreOptionsMenu = videoElement.shadowRoot.querySelector('.overflow-menu');
  //     moreOptionsMenu.appendChild(customControl);
  //   });

  //   return () => {
  //     videoElement.removeAttribute('controlsList', `${controlsList},customControl`);
  //   };
  // }, []);

  // const videoPath = `uploads\\output\\${vv?.filePath.split("\\")[1]}-1080p.mp4`
  const getPathForResolution = (resolution) => {
    return `uploads\\output\\${vv?.filePath.split("\\")[1]}-${resolution}p.mp4`
  }
  const [videoPath, setVideoPath] = useState(getPathForResolution("1080"))

  return (
    <>
      <div className="container_videoPage">
        <div className="container2_videoPage">
          <div className="video_display_screen_videoPage">
            <video
              ref={videoRef}
              src={`http://localhost:5500/${videoPath}`}
              className={"video_ShowVideo_videoPage"}
              controls
            // autoPlay
            ></video>
            <div>
              <select name="" id="" onChange={(ev) => {
                console.log(ev.target.value)
                setVideoPath(getPathForResolution(ev.target.value))
              }}>
                <option value="1080">1080p</option>
                <option value="720">720p</option>
                <option value="480">480p</option>
                <option value="360">360p</option>
              </select>
            </div>
            {showPopup && <div className="locationPopup">{popupContent}</div>}
            <div className="video_details_videoPage">
              <div className="video_btns_title_VideoPage_cont">
                <p className="video_title_VideoPage"> {vv?.videoTitle}</p>
                <div className="views_date_btns_VideoPage">
                  <div className="views_videoPage">
                    {vv?.Views} views <div className="dot"></div>{" "}
                    {moment(vv?.createdAt).fromNow()}
                  </div>
                  <LikeWatchLaterSaveBtns vv={vv} vid={vid} />
                </div>
              </div>
              <Link
                to={`/chanel/${vv?.videoChanel}`}
                className="chanel_details_videoPage"
              >
                <b className="chanel_logo_videoPage">
                  <p>{vv?.Uploder.charAt(0).toUpperCase()}</p>
                </b>
                <p className="chanel_name_videoPage">{vv?.Uploder}</p>
              </Link>
              <div className="comments_VideoPage">
                <h2>
                  <u>Coments</u>
                </h2>
                <Comments videoId={vv._id} />
              </div>
            </div>
          </div>
          <div className="moreVideoBar">More video</div>
        </div>
      </div>
    </>
  );
}

export default VideoPage;
