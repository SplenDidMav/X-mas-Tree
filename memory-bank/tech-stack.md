# Tech Stack（最简单但最健壮）｜圣诞树手势互动网页游戏

> 目标：**尽量少的依赖 + 足够强的稳定性**，能在主流浏览器里顺滑跑起来，并且便于后续加功能（录屏、皮肤、多人等）。

---

## 1) 核心结论：推荐技术栈（MVP → 可上线）

### 运行时（Runtime）
- **语言**：TypeScript  
  - 原因：比纯 JS 更“硬”，手势数据结构/状态机/渲染参数不容易写崩。
- **构建工具**：Vite  
  - 原因：配置极少、启动快、产物干净；对 Three.js / MediaPipe 都很稳。
- **3D 渲染**：Three.js（WebGL）  
  - 原因：生态成熟、资料多、兼容性强；WebGPU 现在还不够“省心”。
- **手部追踪**：MediaPipe Hands（Web 版本）  
  - 原因：端上推理、延迟低、稳定，且已有成熟的摄像头工具与关键点输出。

### 浏览器能力（Browser APIs）
- 摄像头：`navigator.mediaDevices.getUserMedia()`（WebRTC）  
- 上传媒体：`<input type="file" multiple>` + `URL.createObjectURL()`  
- 音视频播放：原生 `<video>`（iOS 需用户交互后播放、静音 autoplay）  
- （可选）录屏导出：`MediaRecorder`（先做成“可用”，再做“好看”）

---

## 2) 你会得到什么（Why this is the “sweet spot”）
- **依赖最少**：只保留 3 个大件：Vite + Three.js + MediaPipe Hands
- **健壮**：TypeScript + 简单状态机，能抵抗“越写越乱”的自然熵增
- **可维护**：模块边界清晰（输入/状态/场景/资源/UI）
- **性能可控**：Three.js + 少量后处理（Bloom 可选），可以逐级降级

---

## 3) 项目结构建议（保持简单）
```
src/
  main.ts                 # 入口：初始化 UI、启动引擎
  core/
    stateMachine.ts       # 游戏状态机（TREE / TRANSFORM / TORNADO / PAUSE）
    config.ts             # 可调参数（阈值、速度衰减、数量上限）
  input/
    camera.ts             # getUserMedia + video element 管理
    hands.ts              # MediaPipe Hands 管线 + 防抖/阈值
    gestures.ts           # 手势识别（pinch / swipe / open palm）
  scene/
    renderer.ts           # Three.js renderer + resize + DPR cap
    tree.ts               # 圣诞树对象（灯、球、带、针叶）
    tornado.ts            # 媒体龙卷风/走马灯对象
    transition.ts         # 树 ⇄ 旋风 转场动画
  media/
    library.ts            # 用户上传素材管理（图片/GIF/视频）
    textures.ts           # 纹理加载、缓存、释放
  ui/
    overlay.ts            # 引导、权限提示、置信度显示
    controls.ts           # 上传、排序、暂停按钮
```

---

## 4) 必要的“硬性工程化”（不多，但很值）
> 这是“健壮”的关键：不复杂，但能防止项目从可控变成泥浆。

- **代码质量**：ESLint + Prettier（基础规则就够了）
- **类型检查**：`tsc --noEmit`（CI 里跑一次）
- **自动部署**：Vercel / Netlify / GitHub Pages（三选一）
- **最小 CI**（可选但推荐）：GitHub Actions  
  - 步骤：install → typecheck → build

---

## 5) 依赖清单（最小可用）
### 必选
- `vite`
- `typescript`
- `three`
- `@mediapipe/hands`
- `@mediapipe/camera_utils`

### 可选（按需再加）
- 动画：`gsap`（想要“丝滑转场”再加）
- 录屏：不需要库，先用 `MediaRecorder`（足够）
- UI 框架：**先别上 React/Vue**（MVP 阶段 UI 很薄，原生 DOM 足够）

---

## 6) 关键实现策略（让它更稳）
- **手势识别做成状态机**：输入永远不直接驱动场景，只修改“意图变量”（例如 openProgress、spinVelocity）。
- **防抖 + 冷却**：  
  - pinch 用 200–400ms 平滑窗口  
  - swipe 用速度阈值 + 300ms cooldown
- **性能阀门**：  
  - 限制 `renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))`  
  - 限制同时可见媒体数量（例如 60 张上限，按设备性能动态降）
- **资源释放**：换素材/退出时 `texture.dispose()`，避免显存爆炸

---

## 7) 为什么不推荐更“豪华”的方案（先不选）
- **React/Vue**：会让你多一套状态和渲染心智负担；你这个项目核心在 WebGL 场景与输入管线，UI 只是薄壳。
- **WebGPU**：未来很香，但目前跨设备“省心度”不如 WebGL。
- **自研手势模型**：成本高、坑多、收益不大；MediaPipe 已够用。

---

## 8) 一句话版本（给你做 README 用）
**Vite + TypeScript + Three.js + MediaPipe Hands**：最少依赖、兼容性强、性能可控、工程化够硬，适合你的“摄像头手势驱动 WebGL 变形/走马灯”游戏。

---
"""