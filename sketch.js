let video;
let poseNet;
let poses = [];
let flipVideo = true;
let previousPose = null;
let isModelLoaded = false;

// Customizable UI settings
const uiSettings = {
  keypointColor: [66, 245, 114],
  skeletonColor: [66, 245, 203],
  keypointSize: 10,
  skeletonWeight: 4,
  confidenceThreshold: 0.6, // Higher threshold for more accurate detection
  smoothing: 0.7 // Between 0 (no smoothing) and 1 (max smoothing)
};

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent('sketch-container');
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  poseNet = ml5.poseNet(video, { flipHorizontal: flipVideo }, modelLoaded);
  poseNet.on('pose', function(results) {
    // Smoothing: blend previous pose with new pose
    if (results.length > 0) {
      if (previousPose) {
        let newPose = results[0].pose;
        for (let i = 0; i < newPose.keypoints.length; i++) {
          newPose.keypoints[i].position.x = lerp(
            previousPose.keypoints[i].position.x,
            newPose.keypoints[i].position.x,
            1 - uiSettings.smoothing
          );
          newPose.keypoints[i].position.y = lerp(
            previousPose.keypoints[i].position.y,
            newPose.keypoints[i].position.y,
            1 - uiSettings.smoothing
          );
        }
        poses = [{ pose: newPose, skeleton: results[0].skeleton }];
        previousPose = newPose;
      } else {
        poses = results;
        previousPose = results[0].pose;
      }
    }
  });
}

function modelLoaded() {
  console.log('PoseNet model loaded!');
  isModelLoaded = true;
}

function draw() {
  image(video, 0, 0, width, height);

  // Draw keypoints
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      if (keypoint.score > uiSettings.confidenceThreshold) {
        fill(...uiSettings.keypointColor);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, uiSettings.keypointSize, uiSettings.keypointSize);
      }
    }
  }

  // Draw skeleton
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(...uiSettings.skeletonColor);
      strokeWeight(uiSettings.skeletonWeight);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}