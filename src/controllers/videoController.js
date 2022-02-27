import User from "../models/User";
import Video from "../models/Video";

// Root Controllers

export const home = async (req, res) => {
  const videos = await Video.find({}).sort({ createdAt: "desc" });
  return res.render("home", { pageTitle: "Home", videos });
};

export const search = async (req, res) => {
  const { keyword } = req.query;

  let videos = [];
  if (keyword)
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    });

  return res.render("search", { pageTitle: "Search", videos });
};

// Public Video Controllers

export const getUpload = (req, res) =>
  res.render("videos/upload", { pageTitle: "Upload Video" });

export const postUpload = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    file: { path },
    body: { title, description, hashtags },
  } = req;

  try {
    const newVideo = await Video.create({
      path,
      title,
      description,
      hashtags: Video.formatHashtags(hashtags),
      owner: _id,
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("videos/upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

// Personal Video Controllers

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner");

  if (!video)
    return res.status(404).render("404", { pageTitle: "Video not found." });

  return res.render("videos/watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id },
    },
  } = req;
  const video = await Video.findById(id);

  if (!video)
    return res.status(404).render("404", { pageTitle: "Video not found." });

  if (String(video.owner) !== _id) return res.status(403).redirect("/");

  return res.render("videos/edit", {
    pageTitle: `Edit ${video.title}`,
    video,
  });
};

export const postEdit = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id },
    },
    body: { title, description, hashtags },
  } = req;
  const video = await Video.exists({ _id: id });

  if (!video)
    return res.status(404).render("404", { pageTitle: "Video not found." });

  if (String(video.owner) !== _id) return res.status(403).redirect("/");

  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });

  return res.redirect(`/videos/${id}`);
};

export const deleteVideo = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id },
    },
  } = req;
  const video = await Video.findById(id);

  if (!video)
    return res.status(404).render("404", { pageTitle: "Video not found." });

  if (String(video.owner) !== _id) return res.status(403).redirect("/");

  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};
