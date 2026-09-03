// Content extracted verbatim from the original single-file site.
// Nothing here is invented; paths were re-rooted for Vite's public/ folder.

export type MediaType = "youtube" | "cloudinary" | "native";

export interface MediaItem {
  type: MediaType;
  id: string;
  title: string;
  meta: string;
  thumbnailPresentation?: "square" | "portrait" | "landscape";
  videoUrl?: string;
  posterUrl?: string;
  embedUrl?: string;
}

export interface AutomationProject {
  slug: string;
  title: string;
  tool: string;
  category: string;
  thumbnail: string;
  summary: string;
  modules: Record<string, any>;
  outputGroup?: string;
}

export const automationProjects: AutomationProject[] = [
  {
    slug: "script-to-motion",
    title: "Script to Motion",
    tool: "Mosaic 2.0",
    category: "Automation workflow",
    thumbnail: "/assets/automation/script-to-motion/mosaic-2-interface.png",
    summary: "A script-to-video production workflow for In-App and Promo flows, converting structured inputs into duration-aligned, stitched videos with consistent voiceover.",
    modules: {
      overview: {
        description: "Mosaic 2.0 is a script-to-video operations workflow for In-App and Promo production. It turns scripts, character references, aspect-ratio requirements, and character voice IDs into structured scenes, generated clips, stitched videos, and consistent final voiceover.",
        inputs: ["Script", "Character Canvas references", "Aspect ratio", "ElevenLabs voice IDs for characters"]
      },
      interface: {
        imageUrl: "/assets/automation/script-to-motion/mosaic-2-interface.png",
        alt: "Mosaic 2.0 interface showing production counters and task inputs for In-App and Promo script-to-video generation."
      },
      architecture: [
        {
          title: "Inputs",
          steps: ["Script", "Character Canvas", "Aspect ratio", "ElevenLabs character voice IDs"]
        },
        {
          title: "Script and visual planning",
          steps: ["Break the script into scenes and beats", "Align scene and shot durations", "Select shots, framing, and composition", "Tag characters from Character Canvas"]
        },
        {
          title: "Generation and assembly",
          steps: ["Create generation prompts", "Queue prompts to the selected model", "Generate video clips", "Stitch the generated clips"]
        },
        {
          title: "Voice and final output",
          steps: ["Apply speech-to-speech (STS) for consistent voiceover", "Validate the assembled result", "Deliver the final output"]
        }
      ],
      outputs: {
        knownIssue: "Known issue: audio consistency is still being tuned. We use ElevenLabs Voice ID and speech-to-speech (STS) to keep the voiceover consistent; these outputs were generated before the latest audio fix."
      }
    },
    outputGroup: "scriptToMotionOutputs"
  },
  {
    slug: "script-to-image",
    title: "Script to Image",
    tool: "Pablo",
    category: "Automation workflow",
    thumbnail: "/assets/automation/script-to-image/pablo-interface.png",
    summary: "A script-to-image production workflow that generates consistent scene grids, aligns image slices to narration, and stitches them into a slideshow video.",
    modules: {
      overview: {
        description: "Pablo converts a script, Character Canvas, aspect ratio, and ElevenLabs voice IDs into consistent image sequences over narration. It completes the production pass while ACDs handle the final visual and editorial fixes.",
        inputs: ["Script", "Character Canvas references", "Aspect ratio", "ElevenLabs voice IDs for characters"]
      },
      feedback: {
        description: "Creative Director feedback from QC Loop testing shows a substantial reduction in output errors compared with the previous tool.",
        previousTool: "Previous tool (AutoAI)",
        previousErrorRate: "Approx. 40% error rate",
        currentTool: "Current workflow",
        currentErrorRate: "Approx. 10% error rate",
        items: [
          {
            title: "Drama – TGS",
            bullets: [
              "Better composition, depth, choreography, and fewer visual distortions than AutoAI.",
              "Main issues: character/location continuity, split-screen leakage, and occasional costume or anatomy errors."
            ],
            errorRate: "10.26%"
          },
          {
            title: "Romantasy – TAB",
            bullets: [
              "Better overall output, with improved location consistency and scene context than AutoAI.",
              "Main issues: dark images, over-processed textures, weak expressions or actions, and occasional anatomy errors."
            ],
            errorRate: "9.36%"
          }
        ],
        note: "These assets had QC Loop on; CDs were asked for an overall hygiene check of the output sheet. Final testing: 25/08.",
        imageUrl: "/assets/automation/script-to-image/cd-feedback.png",
        alt: "Creative Director feedback screenshot showing QC Loop results for Drama - TGS and Romantasy - TAB."
      },
      interface: {
        imageUrl: "/assets/automation/script-to-image/pablo-interface.png",
        alt: "Pablo interface showing Script to Image task inputs, aspect ratio options, and image model controls."
      },
      grids: [
        { label: "3×3 scene grid", columns: 3, caption: "Nine consistent images for one scene and location before slicing." },
        { label: "2×2 scene grid", columns: 2, caption: "Four-image layout for a lighter scene while preserving spatial continuity." }
      ],
      architecture: [
        { title: "Inputs", steps: ["Script", "Character Canvas", "Aspect ratio", "ElevenLabs voice IDs"] },
        { title: "Scene planning", steps: ["Break the script into scenes and beats", "Choose single narration or multicast voices"] },
        { title: "Grid generation", steps: ["Generate a 3×3 or 2×2 scene grid", "Slice the selected grid into individual images"] },
        { title: "Audio alignment", steps: ["Send dialogue to ElevenLabs", "Measure sentence duration", "Place image slices over matching timestamps"] },
        { title: "QC and delivery", steps: ["Fix continuity, blank images, location drift, and SFW issues", "Stitch the slideshow video", "ACDs finish the remaining production fixes"] }
      ],
      outputs: { description: "One view-only slideshow video assembled from narration-aligned images." }
    },
    outputGroup: "scriptToImageOutputs"
  },
  {
    slug: "character-standardization",
    title: "Character Standardization",
    tool: "Character Canvas",
    category: "Automation workflow",
    thumbnail: "/assets/automation/character-standardization/character-coverage.png",
    summary: "A full automation workflow for standardized character, location, and prop canvases that improves coverage and continuity across image and video generation.",
    modules: {
      overview: {
        description: "This workflow creates consistent, standardized canvases for every character, location, and prop. A repeatable coverage structure gives downstream image and video generation more control over continuity, framing, and spatial detail.",
        inputs: ["Entity description", "Reference image", "Entity type: character, location, or prop"]
      },
      coverage: {
        description: "Each entity type uses the same coverage logic so teams can generate, review, and reuse a dependable visual reference set.",
        examples: [
          {
            label: "Character coverage",
            imageUrl: "/assets/automation/character-standardization/character-coverage.png",
            alt: "Character coverage example for consistent entity coverage.",
            caption: "Front, rear, side, and close-up views standardize a character for downstream generation."
          },
          {
            label: "Location coverage",
            imageUrl: "/assets/automation/character-standardization/location-coverage.png",
            alt: "Location coverage example for consistent entity coverage.",
            caption: "Wide, detail, entry, perspective, and atmosphere views preserve a location across scenes."
          },
          {
            label: "Prop coverage",
            imageUrl: "/assets/automation/character-standardization/prop-coverage.png",
            alt: "Prop coverage example for consistent entity coverage.",
            caption: "A fixed multi-angle layout gives props a stable reference for continuity and reuse."
          }
        ]
      },
      architecture: [
        { title: "Inputs", steps: ["Entity description", "Reference image", "Character, location, or prop type"] },
        { title: "Prompt structures", steps: ["Select the entity-specific prompt structure", "Generate a coverage prompt from the description and reference", "Queue the generation request"] },
        { title: "Coverage generation", steps: ["Generate the standardized grid", "Capture views, distances, details, and spatial context", "Keep the grid structure consistent for every entity"] },
        { title: "Standardized output", steps: ["Review the high-coverage canvas", "Reuse it for image and video generation", "Maintain continuity across scenes and shots"] }
      ]
    }
  },
  {
    slug: "growth-show-thumbnail-generation",
    title: "Growth Show Thumbnail Generation",
    tool: "Pocket FM",
    category: "Automation workflow",
    thumbnail: "/assets/automation/growth-show-thumbnail-generation/app-example.png",
    summary: "A show-level thumbnail generation workflow that turns Story Canon into genre-aware title options, consistent thumbnail variations, and testable winners.",
    modules: {
      overview: {
        description: "A separate research seed of 500–600 high-performing movie and series thumbnails is analyzed ahead of generation to create genre-specific composition instructions. Story Canon then compresses a long-running show into the major events, characters, important story factors, and episode synopses the model needs to select strong thumbnail scenarios. The gallery below shows initial test thumbnails, not the research seed.",
        inputs: ["Story Canon", "Show and genre context", "Genre-specific composition instructions", "Title and thumbnail review choices"]
      },
      "app-example": {
        imageUrl: "/assets/automation/growth-show-thumbnail-generation/app-example.png",
        alt: "Pocket FM app example showing rows of generated show thumbnails with play counts, ratings, and genre labels."
      },
      gallery: {
        description: "These are initial test thumbnails from the supplied Top 10 workbook tab. They are not the 500–600-thumbnail research seed: that seed is analyzed separately to derive genre-specific composition instructions. Each show keeps its own header and nine square samples for a focused first-pass review.",
        sourceLabel: "Thumbnail 50 Shows workbook · Top 10 tab · 9 unique shows",
        shows: [
          { name: "Heir in Hiding", urls: ["https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_37pzGzzmUXohxf1FeaOWpSFFnzu%2Fhf_20260505_122529_a2ef7a61-14b1-43ab-af30-843a7d1e0ac0.png&w=1920&q=85", "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_37pzGzzmUXohxf1FeaOWpSFFnzu%2Fhf_20260505_094750_dd689571-e579-446f-b0b1-81cb46efdc84.png&w=1920&q=85", "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_37pzGzzmUXohxf1FeaOWpSFFnzu%2Fhf_20260505_100704_0b973592-22fd-4e0d-a6f5-40b2d6121190.png&w=1920&q=85", "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_37pzGzzmUXohxf1FeaOWpSFFnzu%2Fhf_20260505_120514_c8bb4529-9dcf-40a7-9fc0-ca3e849005eb.png&w=1920&q=85", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3179915_0.png", "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_37pzGzzmUXohxf1FeaOWpSFFnzu%2Fhf_20260505_103706_e16ab364-04a3-4d70-9215-a63e14d13342.png&w=1920&q=85", "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_37pzGzzmUXohxf1FeaOWpSFFnzu%2Fhf_20260505_103724_20055de8-2483-4ad9-ae15-a93e7d22fa7a.png&w=1920&q=85", "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_37pzGzzmUXohxf1FeaOWpSFFnzu%2Fhf_20260505_103737_a2ac13ae-1ddf-4b16-8dea-4c8346403284.png&w=1920&q=85", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3179900_0.png"] },
          { name: "Twists of Love & Revenge", urls: ["https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/gpt_image_edit_d43a062d-bb4b-45ff-8a49-af9e300ed717_0.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/gpt_image_edit_404fccbd-2a63-442b-a872-a2bc46f4cfc5_0.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/gpt_image_edit_c9e503fd-4a0a-4aeb-858f-e0ae834cf2af_0.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/gpt_image_edit_b62c7f48-487b-4fe3-8d31-11060dbfe852_0.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/gpt_image_edit_e0f84567-1463-43fe-a291-34ed1bdc6759_0.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/gpt_image_edit_a63c66c7-5876-4c23-ba5f-76aa8ae0b012_0.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/gpt_image_edit_22b2b0d7-cb17-40e3-acb9-dcdd9099190d_0.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/gpt_image_edit_09244bfb-902f-4cfb-b635-e56b57a2a446_0.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/gpt_image_edit_85de9526-585a-4091-9618-092fd2ce4337_0.png"] },
          { name: "The Alpha's Bride", urls: ["https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3111495_1.png", "https://djhonz7dexnot.cloudfront.net/bd682e51800ddfbd9e4a70bd694e64f71a97cdf3.jpg", "https://djhonz7dexnot.cloudfront.net/9111906cf513d9f9cabe52eea72d481285f0d3fb.jpg", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3111652_1.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3111866_1.png", "https://djhonz7dexnot.cloudfront.net/2622f9f660152f36c9a1c853be5e7b21a5443f61.jpg", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3111999_1.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3112151_1.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3112188_1.png"] },
          { name: "My Vampire System", urls: ["https://djhonz7dexnot.cloudfront.net/1c65565efa83c3b244257b9dcd59461e885861c2.jpg", "https://djhonz7dexnot.cloudfront.net/3f6cc2842fe849cdcc8b8b231cf5b4ba4bbcbda5.jpg", "https://djhonz7dexnot.cloudfront.net/f90024c1899058692babffedf6d94f94da056936.jpg", "https://djhonz7dexnot.cloudfront.net/35a52a8213d0caf3aad29dd3a953fd327073e7da.jpg", "https://djhonz7dexnot.cloudfront.net/5a8c3e879086fcaf304c934e3becf9cbb620011b.jpg", "https://djhonz7dexnot.cloudfront.net/5bad4add1ac53beb69998846e9811bd3160da61b.jpg", "https://djhonz7dexnot.cloudfront.net/8b175d7d3f4179c94df75ed97abef5a9313f11bb.jpg", "https://djhonz7dexnot.cloudfront.net/f249dc173b18bf34537865a8fa07df1484cda6ae.jpg", "https://djhonz7dexnot.cloudfront.net/c9968f09d22fce498b4b6ceeb62f39b1f7dfe7d6.jpg"] },
          { name: "The Godfather's Son", urls: ["https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3417000_0.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3417013_1.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3417103_0.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3417171_0.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3417442_0.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3417255_1.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3417456_0.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3417273_0.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3417473_0.png"] },
          { name: "The Royal Accident", urls: ["https://djhonz7dexnot.cloudfront.net/74a29a74518dbf849d59d2a1149a0f781f25a78a.jpg", "https://djhonz7dexnot.cloudfront.net/2ac06ad2798f6a94cfd68138b479b143c2b602e3.jpg", "https://djhonz7dexnot.cloudfront.net/16c837ab9b2a7c66be2aebf85b02b20ff5ccef54.jpg", "https://djhonz7dexnot.cloudfront.net/e8a876d95539e9da575266e5916340832bc919e5.jpg", "https://djhonz7dexnot.cloudfront.net/ec2dc6357a86ddefa6da2dd2226bb339d6611ad8.jpg", "https://djhonz7dexnot.cloudfront.net/75e92aee1019361359625934630af134c91e22d3.jpg", "https://djhonz7dexnot.cloudfront.net/960458be2c8afa532fb677d3649c966db04d3847.jpg", "https://djhonz7dexnot.cloudfront.net/4fb03775208ac4d6449efc2fa2a21b9679f3124e.jpg", "https://djhonz7dexnot.cloudfront.net/b97dfad64bdd83b077c30648737ae272740d774d.jpg"] },
          { name: "Weakest Beast Tamer", urls: ["https://djhonz7dexnot.cloudfront.net/b9e7c9b5b17e479be0c7b0a17f2e004b8abbfb07.jpg", "https://djhonz7dexnot.cloudfront.net/e1ef2a015c28c72e95848093cf6e68f91f0edce8.jpg", "https://djhonz7dexnot.cloudfront.net/23d42f53f1232ceb162964c410e2ca65f85bb0f5.jpg", "https://djhonz7dexnot.cloudfront.net/84129a7123d2d15639a019b602819c0eb835d749.jpg", "https://djhonz7dexnot.cloudfront.net/da6d54b705b9f594ccf595b2c730d83862f3a866.jpg", "https://djhonz7dexnot.cloudfront.net/1ed91815b1b5b36b8dcdae8c1f453ab56b43dd1b.jpg", "https://djhonz7dexnot.cloudfront.net/9f43fa470a8fc358f2e30fc23df603c33c8eacf1.jpg", "https://djhonz7dexnot.cloudfront.net/29134a3861f3ee6c1a297708bc7a9cbb305cf609.jpg", "https://djhonz7dexnot.cloudfront.net/fb07900597381c0587ebb574012322136f9005bd.jpg"] },
          { name: "Signed & Bound", urls: ["https://djhonz7dexnot.cloudfront.net/f65789ead8fc3749e1eee9855623e368f47c3b1f.jpg", "https://djhonz7dexnot.cloudfront.net/ba50bfef0740230d28b611585a4569ad73471124.jpg", "https://djhonz7dexnot.cloudfront.net/8e99a4f3d7e667d1cce42fce21de75763246bc55.jpg", "https://djhonz7dexnot.cloudfront.net/8c7f92c90bdc609130473838245899999d2c03e3.jpg", "https://djhonz7dexnot.cloudfront.net/fa274df65a89aeba254ce956a74ad2ef73a0747b.jpg", "https://djhonz7dexnot.cloudfront.net/64c06456a3c0e23b53e0edd7297872eabd4ade31.jpg", "https://djhonz7dexnot.cloudfront.net/fbc6372f7f8c737ea13cd3e5a77d5e805edb397e.jpg", "https://djhonz7dexnot.cloudfront.net/ed1543a1ffdeff0d570e0d315956a3376f117461.jpg", "https://djhonz7dexnot.cloudfront.net/dd1bb896fadd9d169485eaac8ab30bcbcf4427bd.jpg"] },
          { name: "Saving Nora", urls: ["https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3114234_1.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3117004_0.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3117063_1.png", "https://djhonz7dexnot.cloudfront.net/09b573ba2072012b39c1f69dc0be5d93c5fe2cae.jpg", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3117086_1.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3117106_1.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3117347_1.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3117170_1.png", "https://storage.googleapis.com/prod-pocketfm-generative-ai/playground/streamlit/nano_banana_output_3117136_1.png"] }
        ]
      },
      architecture: [
        { title: "Research seed", steps: ["Analyze the 500–600 reference thumbnails separately", "Extract composition signals and instructions for each genre", "Apply the best-fit genre instruction set during generation"] },
        { title: "Story Canon and scenarios", steps: ["Compress the long-running show into Story Canon", "Select the top 12 story scenarios for the show", "Keep genre, character, and story context in scope"] },
        { title: "Typography exploration", steps: ["Generate 12 title prompts", "Review four title options at a time", "Choose the title and keep it fixed"] },
        { title: "Thumbnail generation and testing", steps: ["Generate 12 thumbnail prompts", "Review four options per batch with Next", "A/B test the 12 options and select a winner"] },
        { title: "Delivery", steps: ["Place the fixed title on the chosen thumbnail", "Keep the title consistent across new variations", "Ship the winning show thumbnail for app testing"] }
      ]
    }
  },
  {
    slug: "video-dubbing-localization",
    title: "Video Dubbing & Localization",
    tool: "Pocket FM",
    category: "Automation workflow",
    thumbnail: "https://res.cloudinary.com/xfhm04nh/video/upload/so_0/TAB_EP1_English.jpg",
    summary: "A high-scale localization workflow that turns one English master into Hindi and other regional dubs while preserving the original video, music, and SFX.",
    modules: {
      overview: {
        description: "This workflow separates the source video audio, transcribes the dialogue with ElevenLabs STT, translates it with Claude Opus, and generates a duration-matched dub. Language rules handle Hindi gendered forms, while timestamp-aware rewriting keeps dialogue within the original beats so lip-sync stays natural. The localized voice replaces the English VO while the original music and SFX are preserved. At approximately $0.36 per minute, it unlocks broad regional scaling without regenerating the video for every market.",
        inputs: ["English master video", "Target language and regional rules", "ElevenLabs STT and voice configuration", "Dialogue timestamps and duration constraints"]
      },
      architecture: [
        { title: "Inputs", steps: ["Ingest the English master video", "Select Hindi or another target region", "Configure ElevenLabs transcription and voice settings"] },
        { title: "Transcription and translation", steps: ["Separate the source audio", "Extract dialogue with ElevenLabs STT", "Translate with Claude Opus and apply language-specific rules"] },
        { title: "Duration and lip-sync alignment", steps: ["Capture timestamps for each dialogue section", "Rewrite lines to fit the original durations", "Run two or three timing trials before advancing"] },
        { title: "Audio replacement", steps: ["Clean and isolate the English VO", "Replace it with the localized VO", "Preserve the original music and SFX bed"] },
        { title: "Scale and delivery", steps: ["Stitch the localized output", "Review lip-sync and language quality", "Reuse the same video master across Hindi, LATAM, and EU markets"] }
      ],
      outputs: { description: "View-only English and Hindi-dubbed versions of the same Pocket FM episode." }
    },
    outputGroup: "videoDubbingLocalizationOutputs"
  }
];

export const portfolioWork = {
  scriptToMotionOutputs: [
    {
      type: "native",
      id: "script-to-motion-output-01",
      title: "Output 01",
      meta: "Mosaic 2.0",
      videoUrl: "/assets/automation/script-to-motion/output-02.mp4",
      posterUrl: "/assets/automation/script-to-motion/output-02-poster.jpg",
      thumbnailPresentation: "square"
    },
    {
      type: "native",
      id: "script-to-motion-output-02",
      title: "Output 02",
      meta: "Mosaic 2.0",
      videoUrl: "/assets/automation/script-to-motion/output-01.mp4",
      posterUrl: "/assets/automation/script-to-motion/output-01-poster.jpg",
      thumbnailPresentation: "square"
    }
  ],
  scriptToImageOutputs: [
    {
      type: "native",
      id: "script-to-image-merged",
      title: "Output 1",
      meta: "Pablo · Beta output",
      videoUrl: "/assets/automation/script-to-image/merged.mp4",
      posterUrl: "/assets/automation/script-to-image/merged-poster.jpg",
      thumbnailPresentation: "portrait"
    }
  ],
  videoDubbingLocalizationOutputs: [
    {
      type: "cloudinary",
      id: "TAB_EP1_English",
      title: "English Original",
      meta: "Pocket FM · View only",
      thumbnailPresentation: "landscape",
      embedUrl: "https://player.cloudinary.com/embed/?cloud_name=xfhm04nh&public_id=TAB_EP1_English",
      videoUrl: "https://res.cloudinary.com/xfhm04nh/video/upload/TAB_EP1_English.mp4",
      posterUrl: "https://res.cloudinary.com/xfhm04nh/video/upload/so_0/TAB_EP1_English.jpg"
    },
    {
      type: "cloudinary",
      id: "TAB_EP1_hindi_dubbed",
      title: "Hindi Dubbed",
      meta: "Pocket FM · View only",
      thumbnailPresentation: "landscape",
      embedUrl: "https://player.cloudinary.com/embed/?cloud_name=xfhm04nh&public_id=TAB_EP1_hindi_dubbed",
      videoUrl: "https://res.cloudinary.com/xfhm04nh/video/upload/TAB_EP1_hindi_dubbed.mp4",
      posterUrl: "https://res.cloudinary.com/xfhm04nh/video/upload/so_0/TAB_EP1_hindi_dubbed.jpg"
    }
  ],
  direction: [
    { type: "youtube", id: "O85owgJC71E", title: "ATLAS - Promotion", meta: "Pocket FM", thumbnailPresentation: "landscape" },
    { type: "youtube", id: "ukx7G_kIKiE", title: "Saaya Trailer 1", meta: "Pocket FM", thumbnailPresentation: "landscape" },
    { type: "youtube", id: "_HREevjk8pI", title: "Saaya Trailer 2", meta: "Pocket FM", thumbnailPresentation: "landscape" },
    { type: "youtube", id: "YqCtGx79e14", title: "Commander Vikram Trailer 3", meta: "Pocket FM", thumbnailPresentation: "landscape" },
    { type: "youtube", id: "nUOQHxXk-zw", title: "TAB IOC", meta: "Pocket FM", thumbnailPresentation: "square" },
    { type: "youtube", id: "Erdx6a5u82w", title: "Christmas Gringe IOC", meta: "Pocket FM", thumbnailPresentation: "square" },
    {
      type: "cloudinary",
      id: "DEC25745_Sibling_Eater_Sunny_s_Base_CTA_W_Sunny_E_Nadeem_26-12-25_-_Trim",
      title: "Sibling IOC",
      meta: "Pocket FM",
      thumbnailPresentation: "square",
      embedUrl: "https://player.cloudinary.com/embed/?cloud_name=xfhm04nh&public_id=DEC25745_Sibling_Eater_Sunny_s_Base_CTA_W_Sunny_E_Nadeem_26-12-25_-_Trim",
      videoUrl: "https://res.cloudinary.com/xfhm04nh/video/upload/DEC25745_Sibling_Eater_Sunny_s_Base_CTA_W_Sunny_E_Nadeem_26-12-25_-_Trim.mp4",
      posterUrl: "https://res.cloudinary.com/xfhm04nh/video/upload/so_0/DEC25745_Sibling_Eater_Sunny_s_Base_CTA_W_Sunny_E_Nadeem_26-12-25_-_Trim.jpg"
    }
  ],
  ai: [
    { type: "youtube", id: "potP_flMx7M", title: "Durex - He Comes First Always", meta: "Brand Ad Creative" },
    { type: "youtube", id: "G7L1SzwLp8o", title: "JH Stop Motion Reel", meta: "Brand Ad Creative" },
    { type: "youtube", id: "t10ck5_TsD4", title: "Bangur - Building", meta: "Brand Ad Creative" },
    { type: "youtube", id: "6zUbgMErI2s", title: "Bangur - Solid Home", meta: "Brand Ad Creative" },
    { type: "youtube", id: "vxRmEFUph1g", title: "Bangur Reel", meta: "Brand Ad Creative" },
    { type: "youtube", id: "PvKiEMKEKOc", title: "Atlys - Venice Sinking", meta: "Brand Ad Creative" },
    { type: "youtube", id: "xEFEFZ8RVpg", title: "AI Animation", meta: "Midjourney and Runway" },
    { type: "youtube", id: "TYTP3Ex1_R8", title: "Beauty and Skincare Ad", meta: "Raver.ai" },
    { type: "youtube", id: "nJvgq5FCZC0", title: "WheelsEye", meta: "AI Ad Marketing" },
    { type: "youtube", id: "z-AQclIU4Zg", title: "Reel and Shorts", meta: "Freelance" },
    { type: "youtube", id: "-qe3o_-eUuc", title: "Improve Your Engagement", meta: "Talking Head / Influencer Marketing" },
    { type: "youtube", id: "gZBdL2E04Fs", title: "Velvet Promo", meta: "Promo / BSK" },
    { type: "youtube", id: "Sej7XZ3g3RU", title: "YouTube Success", meta: "Talking Head / Influencer Marketing" },
    { type: "youtube", id: "_1OsamWkPXU", title: "BeeMG Intro Video", meta: "Corporate Intro" },
    { type: "youtube", id: "f8nFT1dLEZs", title: "Zeno App Demo", meta: "Product Demo" },
    { type: "youtube", id: "fEqG0l6MyXI", title: "Ankur Warikoo Edit", meta: "Talking Head" },
    { type: "youtube", id: "MV_zQ_U9mH4", title: "Intro Edits", meta: "Portfolio" },
    { type: "youtube", id: "RdqdFpRQQzs", title: "Pocket FM Motion Graphics", meta: "Motion Graphics" },
    { type: "youtube", id: "bhrEm67srvo", title: "DreamSeekers Webinar", meta: "Webinar" },
    { type: "youtube", id: "PYqNOuU8muo", title: "Pocket FM Promo", meta: "Promo" },
    { type: "youtube", id: "kcvspr8k7kE", title: "Pocket FM Storytelling", meta: "Storytelling" },
    { type: "youtube", id: "lebVkoagJ1I", title: "One Piece Anime Short", meta: "Anime Video / Otaku Shonen" }
  ]
};
