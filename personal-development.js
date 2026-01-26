// personal-development.js
const personalDevelopmentBooks = [
    // كل بيانات الكتب والنصوص
    { 
                id: 10,
                title: "The 7 Habits of Highly Effective People",
                author: "Stephen R. Covey",
                category: "development",
                description: "A business and self-help book presenting an approach to being effective in attaining goals",
                pages: 5,
                coverImage: "7habits.jpg",
                content: [
                    {
                        title: "The Inside-Out Approach",
                        description: "Introduction to the concept of character ethics",
                        image: "7habits.jpg",
                        text: `<div class="episode-title">Part 1: Paradigms and Principles</div>
                        <div class="book-description">
                            <strong>Book Description:</strong> A business and self-help book presenting an approach to being effective in attaining goals.
                        </div>
                        <p>In more than 25 years of working with people in business, university, and marriage and family settings, I have come in contact with many individuals who have achieved an incredible degree of outward success, but have found themselves struggling with an inner hunger, a deep need for personal congruency and effectiveness and for healthy, growing relationships with other people.</p>
                        <p>I suspect that some of the problems they have shared with me may be familiar to you. I've listened to them and worked with them. And I've learned from them. And I've learned that the solutions to our deepest problems are not to be found "out there," but "in here."</p>
                        <p class="source-reference">Source: The 7 Habits of Highly Effective People by Stephen R. Covey</p>`
                    },
                    {
                        title: "Habit 1: Be Proactive",
                        description: "The first habit - taking initiative and responsibility",
                        image: "7habits.jpg",
                        text: `<div class="episode-title">Habit 1: Be Proactive</div>
                        <p>While the word proactivity is now fairly common in management literature, it is a word you won't find in most dictionaries. It means more than merely taking initiative. It means that as human beings, we are responsible for our own lives. Our behavior is a function of our decisions, not our conditions.</p>
                        <p>We can subordinate feelings to values. We have the initiative and the responsibility to make things happen.</p>
                        <p>Look at the word responsibility—"response-ability"—the ability to choose your response. Highly proactive people recognize that responsibility. They do not blame circumstances, conditions, or conditioning for their behavior. Their behavior is a product of their own conscious choice, based on values, rather than a product of their conditions, based on feeling.</p>
                        <p class="source-reference">Source: The 7 Habits of Highly Effective People by Stephen R. Covey</p>`
                    },
                    {
                        title: "Habit 2: Begin with the End in Mind",
                        description: "The second habit - envisioning what you want to achieve",
                        image: "7habits.jpg",
                        text: `<div class="episode-title">Habit 2: Begin with the End in Mind</div>
                        <p>Begin with the End in Mind means to begin each day, task, or project with a clear vision of your desired direction and destination, and then continue by flexing your proactive muscles to make things happen.</p>
                        <p>One of the best ways to incorporate Habit 2 into your life is to develop a Personal Mission Statement. It focuses on what you want to be and do. It is your plan for success. It reaffirms who you are, puts your goals in focus, and moves your ideas into the real world. Your mission statement makes you the leader of your own life.</p>
                        <p>To begin with the end in mind means to start with a clear understanding of your destination. It means to know where you're going so that you better understand where you are now and so that the steps you take are always in the right direction.</p>
                        <p class="source-reference">Source: The 7 Habits of Highly Effective People by Stephen R. Covey</p>`
                    },
                    {
                        title: "Habit 3: Put First Things First",
                        description: "The third habit - prioritization and time management",
                        image: "7habits.jpg",
                        text: `<div class="episode-title">Habit 3: Put First Things First</div>
                        <p>Habit 3 is the practical fulfillment of Habits 1 and 2. Habit 1 says, "You're the creator. You are in charge." Habit 2 is the first mental creation, based on the principle that all things are created twice. Habit 3 is the second creation, the physical creation.</p>
                        <p>Habit 3 is about life management as well—your purpose, values, roles, and priorities. What are "first things?" First things are those things you, personally, find of most worth. If you put first things first, you are organizing and managing time and events according to the personal priorities you established in Habit 2.</p>
                        <p>The challenge is not to manage time, but to manage ourselves. The key is not to prioritize what's on your schedule, but to schedule your priorities.</p>
                        <p class="source-reference">Source: The 7 Habits of Highly Effective People by Stephen R. Covey</p>`
                    },
                    {
                        title: "The Upward Spiral",
                        description: "The continuous improvement through the seven habits",
                        image: "7habits.jpg",
                        text: `<div class="episode-title">Inside-Out Again</div>
                        <p>The Seven Habits are not a set of separate or piecemeal psyche-up formulas. In harmony with the natural laws of growth, they provide an incremental, sequential, highly integrated approach to the development of personal and interpersonal effectiveness. They move us progressively on a Maturity Continuum from dependence to independence to interdependence.</p>
                        <p>As we learn and live the principles embodied in the Seven Habits, we can experience a true paradigm shift—a change in perception and interpretation of how the world works. We can see and feel the difference in our lives, in our relationships, in our effectiveness. We can break with old paradigms that may have been a source of pseudo-security for years.</p>
                        <p>The Seven Habits represent a new way of thinking—a more accurate paradigm of human nature and human potential. They empower us to break with the traditions of the past and to create for ourselves the kind of life that reflects our true nature and our highest aspirations.</p>
                        <p class="source-reference">Source: The 7 Habits of Highly Effective People by Stephen R. Covey</p>`
                    }
                ]
            },
            {
                id: 11,
                title: "Atomic Habits",
                author: "James Clear",
                category: "development",
                description: "A guide to building good habits and breaking bad ones through tiny changes",
                pages: 5,
                coverImage: "atomic.jpg",
                content: [
                    {
                        title: "The Surprising Power of Atomic Habits",
                        description: "Introduction to the concept of small habits making a big difference",
                        image: "atomic.jpg",
                        text: `<div class="episode-title">Chapter 1: The Surprising Power of Atomic Habits</div>
                        <div class="book-description">
                            <strong>Book Description:</strong> A guide to building good habits and breaking bad ones through tiny changes.
                        </div>
                        <p>It is so easy to overestimate the importance of one defining moment and underestimate the value of making small improvements on a daily basis. Too often, we convince ourselves that massive success requires massive action.</p>
                        <p>Meanwhile, improving by 1 percent isn't particularly notable—sometimes it isn't even noticeable—but it can be far more meaningful, especially in the long run. The difference a tiny improvement can make over time is astounding.</p>
                        <p>Habits are the compound interest of self-improvement. The same way that money multiplies through compound interest, the effects of your habits multiply as you repeat them. They seem to make little difference on any given day and yet the impact they deliver over the months and years can be enormous.</p>
                        <p class="source-reference">Source: Atomic Habits by James Clear</p>`
                    },
                    {
                        title: "How Your Habits Shape Your Identity",
                        description: "The relationship between habits and identity",
                        image: "atomic.jpg",
                        text: `<div class="episode-title">Chapter 2: How Your Habits Shape Your Identity (and Vice Versa)</div>
                        <p>There are three layers of behavior change: a change in your outcomes, a change in your processes, or a change in your identity.</p>
                        <p>Outcomes are about what you get. Processes are about what you do. Identity is about what you believe.</p>
                        <p>Many people begin the process of changing their habits by focusing on what they want to achieve. This leads us to outcome-based habits. The alternative is to build identity-based habits. With this approach, we start by focusing on who we wish to become.</p>
                        <p>The most effective way to change your habits is to focus not on what you want to achieve, but on who you wish to become.</p>
                        <p class="source-reference">Source: Atomic Habits by James Clear</p>`
                    },
                    {
                        title: "The Four Laws of Behavior Change",
                        description: "The framework for building good habits",
                        image: "atomic.jpg",
                        text: `<div class="episode-title">Chapter 3: How to Build Better Habits in 4 Simple Steps</div>
                        <p>In The Power of Habit, Charles Duhigg explains that habits consist of a four-step pattern: cue, craving, response, and reward. This four-step pattern is the backbone of every habit, and your brain runs through these steps in the same order each time.</p>
                        <p>We can transform these four steps into a practical framework that we can use to design good habits and eliminate bad ones. I refer to this framework as the Four Laws of Behavior Change.</p>
                        <p>The Four Laws of Behavior Change are:
                        <ol>
                            <li>Make it obvious</li>
                            <li>Make it attractive</li>
                            <li>Make it easy</li>
                            <li>Make it satisfying</li>
                        </ol>
                        </p>
                        <p class="source-reference">Source: Atomic Habits by James Clear</p>`
                    },
                    {
                        title: "The 1st Law: Make It Obvious",
                        description: "How to make cues for good habits obvious",
                        image: "atomic.jpg",
                        text: `<div class="episode-title">Chapter 4: The Man Who Didn't Look Right</div>
                        <p>With enough practice, your brain will pick up on the cues that predict certain outcomes without consciously thinking about it. Once our habits become automatic, we stop paying attention to what we're doing.</p>
                        <p>The process of behavior change always starts with awareness. You need to be aware of your habits before you can change them. Pointing-and-Calling raises your level of awareness from a nonconscious habit to a more conscious level by verbalizing your actions.</p>
                        <p>The Habits Scorecard is a simple exercise you can use to become more aware of your behavior. To create your own, make a list of your daily habits. Once you have a full list, look at each behavior and ask yourself, "Is this a good habit, a bad habit, or a neutral habit?"</p>
                        <p class="source-reference">Source: Atomic Habits by James Clear</p>`
                    },
                    {
                        title: "The 2nd Law: Make It Attractive",
                        description: "How to make habits attractive",
                        image: "atomic.jpg",
                        text: `<div class="episode-title">Chapter 7: The Secret to Self-Control</div>
                        <p>The more attractive an opportunity is, the more likely it is to become habit-forming. Habits are a dopamine-driven feedback loop. When dopamine rises, so does our motivation to act.</p>
                        <p>It is the anticipation of a reward—not the fulfillment of it—that gets us to take action. The greater the anticipation, the greater the dopamine spike.</p>
                        <p>Temptation bundling is one way to make your habits more attractive. The strategy is to pair an action you want to do with an action you need to do. You're more likely to find a behavior attractive if you get to do one of your favorite things at the same time.</p>
                        <p class="source-reference">Source: Atomic Habits by James Clear</p>`
                    }
                ]
            },
            {
                id: 17,
                title: "Thinking, Fast and Slow",
                author: "Daniel Kahneman",
                category: "development",
                description: "A exploration of the two systems that drive the way we think and make choices",
                pages: 5,
                coverImage: "thinking.jpg",
                content: [
                    {
                        title: "The Characters of the Story",
                        description: "Introduction to System 1 and System 2 thinking",
                        image: "thinking.jpg",
                        text: `<div class="episode-title">Part 1: Two Systems</div>
                        <div class="book-description">
                            <strong>Book Description:</strong> A exploration of the two systems that drive the way we think and make choices.
                        </div>
                        <p>To observe your mind in automatic mode, glance at the image below. Your experience as you look at the woman's face seamlessly combines what we normally call seeing and intuitive thinking. As surely and quickly as you saw that the young woman's hair is dark, you knew she is angry.</p>
                        <p>What you saw extended into the future. You sensed that this woman is about to say some very unkind words, probably in a loud and strident voice. A premonition of what she was going to do next came to mind automatically and effortlessly.</p>
                        <p>This is the work of System 1—the automatic, intuitive, and largely unconscious mode of thinking that helps us navigate the world efficiently.</p>
                        <p class="source-reference">Source: Thinking, Fast and Slow by Daniel Kahneman</p>`
                    },
                    {
                        title: "Attention and Effort",
                        description: "The role of attention in System 2 thinking",
                        image: "thinking.jpg",
                        text: `<div class="episode-title">Chapter 2: Attention and Effort</div>
                        <p>System 2 allocates attention to the effortful mental activities that demand it, including complex computations. The operations of System 2 are often associated with the subjective experience of agency, choice, and concentration.</p>
                        <p>When we think of ourselves, we identify with System 2, the conscious, reasoning self that has beliefs, makes choices, and decides what to think about and what to do. Whereas System 1 operates automatically and quickly, with little or no effort and no sense of voluntary control.</p>
                        <p>System 2 is the one that believes it's in control, but in reality, most of our decisions and judgments are made by System 1, with System 2 merely endorsing them or making minor adjustments.</p>
                        <p class="source-reference">Source: Thinking, Fast and Slow by Daniel Kahneman</p>`
                    },
                    {
                        title: "The Lazy Controller",
                        description: "How System 2 often takes the easy way out",
                        image: "thinking.jpg",
                        text: `<div class="episode-title">Chapter 3: The Lazy Controller</div>
                        <p>One of the main functions of System 2 is to monitor and control thoughts and actions "suggested" by System 1. However, this monitoring is often lax, allowing many intuitive judgments to be expressed, including some that are erroneous.</p>
                        <p>System 2 is lazy, and it tires easily. When we are cognitively busy, we are more likely to make selfish choices, use sexist language, and make superficial judgments in social situations.</p>
                        <p>The phenomenon of "ego depletion" shows that self-control and deliberate thought draw on a limited pool of mental energy. When we're tired or have exerted self-control in one area, we have less willpower and mental energy for other tasks.</p>
                        <p class="source-reference">Source: Thinking, Fast and Slow by Daniel Kahneman</p>`
                    },
                    {
                        title: "The Associative Machine",
                        description: "How System 1 makes connections automatically",
                        image: "thinking.jpg",
                        text: `<div class="episode-title">Chapter 4: The Associative Machine</div>
                        <p>System 1 operates as an associative machine, constantly making connections between ideas, feelings, and experiences. This is why certain words or images can automatically trigger related concepts and emotions.</p>
                        <p>For example, if you recently saw the word "EAT," you are temporarily more likely to complete the word fragment "SO_P" as "SOUP" rather than "SOAP." If you saw the word "WASH," you would be more likely to complete it as "SOAP."</p>
                        <p>These priming effects occur completely automatically and without your awareness. They demonstrate how our thoughts and behaviors can be influenced by seemingly irrelevant factors in our environment.</p>
                        <p class="source-reference">Source: Thinking, Fast and Slow by Daniel Kahneman</p>`
                    },
                    {
                        title: "Cognitive Ease",
                        description: "How we prefer things that are easy to process",
                        image: "thinking.jpg",
                        text: `<div class="episode-title">Chapter 5: Cognitive Ease</div>
                        <p>System 1 is continuously monitoring and assessing the level of cognitive ease or strain. When things feel easy and familiar, we're in a state of cognitive ease. When we encounter something difficult or unfamiliar, we experience cognitive strain.</p>
                        <p>This has important implications for how we perceive truth, beauty, and goodness. Statements that are easier to process are more likely to be judged as true. This is why repetition makes statements seem more truthful—the "illusion of truth" effect.</p>
                        <p>Similarly, people are more likely to judge easy-to-process statements as more intelligent and more beautiful. This is why clear, simple writing is often more persuasive than complex, difficult prose.</p>
                        <p class="source-reference">Source: Thinking, Fast and Slow by Daniel Kahneman</p>`
                    }
                ]
            },
            {
                id: 18,
                title: "The Power of Now",
                author: "Eckhart Tolle",
                category: "development",
                description: "A guide to spiritual enlightenment through living in the present moment",
                pages: 5,
                coverImage: "now.jpg",
                content: [
                    {
                        title: "You Are Not Your Mind",
                        description: "The fundamental discovery of separating from your thoughts",
                        image: "now.jpg",
                        text: `<div class="episode-title">Chapter 1: You Are Not Your Mind</div>
                        <div class="book-description">
                            <strong>Book Description:</strong> A guide to spiritual enlightenment through living in the present moment.
                        </div>
                        <p>The greatest obstacle to enlightenment is identification with your mind, which causes thought to become compulsive. Not being able to stop thinking is a dreadful affliction, but we don't realize this because almost everybody is suffering from it, so it is considered normal.</p>
                        <p>The mind is a superb instrument if used rightly. Used wrongly, however, it becomes very destructive. To put it more accurately, it is not so much that you use your mind wrongly—you usually don't use it at all. It uses you.</p>
                        <p>This is the disease. You believe that you are your mind. This is the delusion. The instrument has taken you over.</p>
                        <p class="source-reference">Source: The Power of Now by Eckhart Tolle</p>`
                    },
                    {
                        title: "Consciousness: The Way Out of Pain",
                        description: "How presence can free you from emotional pain",
                        image: "now.jpg",
                        text: `<div class="episode-title">Chapter 2: Consciousness: The Way Out of Pain</div>
                        <p>Nobody's life is entirely free of pain and sorrow. Isn't it a question of learning to live with them rather than trying to avoid them?</p>
                        <p>The greater part of human pain is unnecessary. It is self-created as long as the unobserved mind runs your life.</p>
                        <p>The pain that you create now is always some form of nonacceptance, some form of unconscious resistance to what is. On the level of thought, the resistance is some form of judgment. On the emotional level, it is some form of negativity.</p>
                        <p>The intensity of the pain depends on the degree of resistance to the present moment, and this in turn depends on how strongly you are identified with your mind.</p>
                        <p class="source-reference">Source: The Power of Now by Eckhart Tolle</p>`
                    },
                    {
                        title: "Moving Deeply into the Now",
                        description: "Techniques for entering the present moment",
                        image: "now.jpg",
                        text: `<div class="episode-title">Chapter 3: Moving Deeply into the Now</div>
                        <p>I don't want to lose my ability to analyze and discriminate. I wouldn't mind learning to think more clearly, in a more focused way, but I don't want to lose my mind. The gift of thought is the most precious thing we have.</p>
                        <p>There is no need to be afraid of losing your mind. You won't lose it. The contrary will happen. The mind actually becomes sharper, more focused, when it is not burdened with the weight of psychological time.</p>
                        <p>The mind can be a beautiful instrument when it is used in service to the Now. It becomes dysfunctional when it takes over your life completely, when you become so identified with the voice in your head that you lose the sense of connection with the deeper reality of Being.</p>
                        <p class="source-reference">Source: The Power of Now by Eckhart Tolle</p>`
                    },
                    {
                        title: "Mind Strategies for Avoiding the Now",
                        description: "How the mind creates resistance to the present",
                        image: "now.jpg",
                        text: `<div class="episode-title">Chapter 4: Mind Strategies for Avoiding the Now</div>
                        <p>The mind constantly seeks to escape the Now. In fact, the mind cannot function in the Now. It requires time—past and future—to survive.</p>
                        <p>If you no longer want to create pain for yourself and others, if you no longer want to add to the residue of past pain that still lives on in you, then don't create any more time, or at least no more than is necessary to deal with the practical aspects of your life.</p>
                        <p>How to stop creating time? Realize deeply that the present moment is all you ever have. Make the Now the primary focus of your life.</p>
                        <p>Whereas before you dwelt in time and paid brief visits to the Now, have your dwelling place in the Now and pay brief visits to past and future when required to deal with the practical aspects of your life situation.</p>
                        <p class="source-reference">Source: The Power of Now by Eckhart Tolle</p>`
                    },
                    {
                        title: "The State of Presence",
                        description: "What it means to be truly present",
                        image: "now.jpg",
                        text: `<div class="episode-title">Chapter 5: The State of Presence</div>
                        <p>Presence is the key to freedom, so you can only be free now. The more you are focused on time—past and future—the more you miss the Now, the most precious thing there is.</p>
                        <p>Why is it the most precious thing? Firstly, because it is the only thing. It's all there is. The eternal present is the space within which your whole life unfolds, the one factor that remains constant.</p>
                        <p>Life is now. There was never a time when your life was not now, nor will there ever be.</p>
                        <p>Secondly, the Now is the only point that can take you beyond the limited confines of the mind. It is your only point of access into the timeless and formless realm of Being.</p>
                        <p class="source-reference">Source: The Power of Now by Eckhart Tolle</p>`
                    }
                ]
            },
            {
    id: 58,
    title: "How to Win Friends and Influence People",
    author: "Dale Carnegie",
    category: "development",
    description: "Classic guide to building relationships and improving social skills",
    pages: 7,
    coverImage: "win-friends.jpg",
    content: [
        {
            title: "Fundamental Techniques",
            description: "Basic principles of handling people",
            image: "win-friends.jpg",
            text: `<div class="episode-title">Part 1: Fundamental Techniques in Handling People</div>
            <div class="book-description">
                <strong>Book Description:</strong> Classic guide to building relationships and improving social skills.
            </div>
            <p>If you want to gather honey, don't kick over the beehive. Criticism is futile because it puts a person on the defensive and usually makes them strive to justify themselves.</p>
            <p>The great psychologist Alfred Adler said, "It is the individual who is not interested in his fellow men who has the greatest difficulties in life."</p>
            <p>The deepest principle in human nature is the craving to be appreciated. People don't criticize themselves for anything, no matter how wrong they may be.</p>
            <p class="source-reference">Source: How to Win Friends and Influence People by Dale Carnegie</p>`
        },
        {
            title: "Six Ways to Make People Like You",
            description: "Building genuine relationships",
            image: "win-friends.jpg",
            text: `<div class="episode-title">Part 2: Six Ways to Make People Like You</div>
            <p>1. Become genuinely interested in other people. You can make more friends in two months by becoming interested in other people than you can in two years by trying to get other people interested in you.</p>
            <p>2. Smile. Actions speak louder than words, and a smile says, "I like you. You make me happy. I am glad to see you."</p>
            <p>3. Remember that a person's name is to that person the sweetest and most important sound in any language.</p>
            <p class="source-reference">Source: How to Win Friends and Influence People by Dale Carnegie</p>`
        },
        {
            title: "How to Win People to Your Way of Thinking",
            description: "Persuasion techniques",
            image: "win-friends.jpg",
            text: `<div class="episode-title">Part 3: How to Win People to Your Way of Thinking</div>
            <p>The only way to get the best of an argument is to avoid it. Show respect for the other person's opinions. Never say, "You're wrong."</p>
            <p>If you are wrong, admit it quickly and emphatically. Begin in a friendly way. Get the other person saying "yes, yes" immediately.</p>
            <p>Let the other person do a great deal of the talking. Let the other person feel that the idea is his or hers. Try honestly to see things from the other person's point of view.</p>
            <p class="source-reference">Source: How to Win Friends and Influence People by Dale Carnegie</p>`
        },
        {
            title: "Be a Leader",
            description: "Leadership principles",
            image: "win-friends.jpg",
            text: `<div class="episode-title">Part 4: Be a Leader</div>
            <p>Begin with praise and honest appreciation. Call attention to people's mistakes indirectly. Talk about your own mistakes before criticizing the other person.</p>
            <p>Ask questions instead of giving direct orders. Let the other person save face. Praise the slightest improvement and praise every improvement.</p>
            <p>Give the other person a fine reputation to live up to. Use encouragement. Make the fault seem easy to correct. Make the other person happy about doing the thing you suggest.</p>
            <p class="source-reference">Source: How to Win Friends and Influence People by Dale Carnegie</p>`
        },
        {
            title: "The Power of Listening",
            description: "Importance of being a good listener",
            image: "win-friends.jpg",
            text: `<div class="episode-title">The Importance of Listening</div>
            <p>Remember that the people you are talking to are a hundred times more interested in themselves and their wants and problems than they are in you and your problems.</p>
            <p>Listening is one of the highest compliments we can pay anyone. It says, "What you're saying is so important that I'm giving you my complete attention."</p>
            <p>If you aspire to be a good conversationalist, be an attentive listener. To be interesting, be interested.</p>
            <p class="source-reference">Source: How to Win Friends and Influence People by Dale Carnegie</p>`
        },
        {
            title: "Handling Complaints",
            description: "Dealing with difficult situations",
            image: "win-friends.jpg",
            text: `<div class="episode-title">Handling Complaints and Criticism</div>
            <p>When dealing with complaints, let the other person do most of the talking. They will tell you everything you need to know if you just listen.</p>
            <p>Be sympathetic with the other person's ideas and desires. Appeal to the nobler motives. Dramatize your ideas.</p>
            <p>Throw down a challenge. The way to get things done is to stimulate competition by challenging people.</p>
            <p class="source-reference">Source: How to Win Friends and Influence People by Dale Carnegie</p>`
        },
        {
            title: "Creating Lasting Relationships",
            description: "Building long-term connections",
            image: "win-friends.jpg",
            text: `<div class="episode-title">Creating Lasting Relationships</div>
            <p>Success in dealing with people depends on a sympathetic grasp of the other person's viewpoint. Cooperativeness in conversation is achieved when you show that you consider the other person's ideas as important as your own.</p>
            <p>People are not logical; they are emotional. They are motivated by pride and vanity. The principles in this book work only when they come from the heart.</p>
            <p>If you want to be successful, you must be genuinely interested in people and make them feel important in a sincere way.</p>
            <p class="source-reference">Source: How to Win Friends and Influence People by Dale Carnegie</p>`
        }
    ]
},
{
    id: 64,
    title: "The 5 AM Club",
    author: "Robin Sharma",
    category: "development",
    description: "Own your morning, elevate your life",
    pages: 7,
    coverImage: "5-am-club.jpg",
    content: [
        {
            title: "The 5 AM Club Concept",
            description: "Introduction to the morning routine philosophy",
            image: "5-am-club.jpg",
            text: `<div class="episode-title">Part 1: The 5 AM Club Concept</div>
            <div class="book-description">
                <strong>Book Description:</strong> Own your morning, elevate your life.
            </div>
            <p>Own your morning. Elevate your life. The 5 AM Club is based on a morning routine that has helped the world's most successful people achieve extraordinary results.</p>
            <p>Legendary leadership and performance expert Robin Sharma introduced The 5 AM Club concept over twenty years ago, based on a revolutionary morning routine that has helped his clients maximize their productivity, activate their best health and bulletproof their serenity in this age of overwhelming complexity.</p>
            <p>The way you start your day dramatically influences your levels of success, productivity and performance. Most people check their phones within minutes of waking up, immediately putting themselves into reactive mode.</p>
            <p class="source-reference">Source: The 5 AM Club by Robin Sharma</p>`
        },
        {
            title: "The 20/20/20 Formula",
            description: "The core morning practice",
            image: "5-am-club.jpg",
            text: `<div class="episode-title">The 20/20/20 Formula</div>
            <p>The 20/20/20 Formula divides the first hour of your day into three 20-minute segments:</p>
            <p>1. Move (20 minutes of exercise)</p>
            <p>2. Reflect (20 minutes of meditation, prayer or journaling)</p>
            <p>3. Grow (20 minutes of learning through reading or studying)</p>
            <p>This formula ensures you're taking care of your physical, emotional and mental health first thing in the morning.</p>
            <p class="source-reference">Source: The 5 AM Club by Robin Sharma</p>`
        },
        {
            title: "The Four Interior Empires",
            description: "Areas of personal development",
            image: "5-am-club.jpg",
            text: `<div class="episode-title">The Four Interior Empires</div>
            <p>1. Mindset Mastery (The Mindset Empire): Your psychology and thinking patterns.</p>
            <p>2. Heartset Mastery (The Heartset Empire): Your emotional world and relationships.</p>
            <p>3. Healthset Mastery (The Healthset Empire): Your physical vitality and energy.</p>
            <p>4. Soulset Mastery (The Soulset Empire): Your spiritual connection and life purpose.</p>
            <p>All four empires must be developed for lasting success and happiness. The 5 AM routine helps you develop all four daily.</p>
            <p class="source-reference">Source: The 5 AM Club by Robin Sharma</p>`
        },
        {
            title: "The Twin Cycles of Elite Performance",
            description: "Rest and recovery principles",
            image: "5-am-club.jpg",
            text: `<div class="episode-title">The Twin Cycles of Elite Performance</div>
            <p>1. The cycle of excellence: Focused, intense work periods followed by complete recovery.</p>
            <p>2. The cycle of failure: Constant work without adequate rest, leading to burnout.</p>
            <p>World-class performers understand that recovery is not a luxury but a necessity for sustained high performance.</p>
            <p>Sleep is not a luxury but a biological necessity. Going to bed early is essential for the 5 AM wake-up.</p>
            <p class="source-reference">Source: The 5 AM Club by Robin Sharma</p>`
        },
        {
            title: "The Habit Installation Protocol",
            description: "Building lasting habits",
            image: "5-am-club.jpg",
            text: `<div class="episode-title">The Habit Installation Protocol</div>
            <p>1. The 66 Day Rule: It takes 66 days to install a new habit permanently.</p>
            <p>2. Consistency beats intensity: Small daily improvements lead to staggering results over time.</p>
            <p>3. The power of ritual: Transform the 5 AM routine into a sacred ritual that you look forward to.</p>
            <p>Don't miss two days in a row. If you miss one day, get back on track immediately the next day.</p>
            <p class="source-reference">Source: The 5 AM Club by Robin Sharma</p>`
        },
        {
            title: "The Second Wind Workout",
            description: "Evening optimization",
            image: "5-am-club.jpg",
            text: `<div class="episode-title">The Second Wind Workout</div>
            <p>In addition to the morning routine, elite performers often add a second workout in the late afternoon or early evening.</p>
            <p>This second workout helps to relieve stress, boost creativity, and improve sleep quality.</p>
            <p>The evening is also an ideal time for reflection, planning the next day, and connecting with loved ones.</p>
            <p>A proper evening routine sets you up for success the next morning.</p>
            <p class="source-reference">Source: The 5 AM Club by Robin Sharma</p>`
        },
        {
            title: "The Victory Hour",
            description: "Making the first hour count",
            image: "5-am-club.jpg",
            text: `<div class="episode-title">The Victory Hour</div>
            <p>The first hour of the day is the Victory Hour. How you spend it determines the quality of your day and ultimately your life.</p>
            <p>During this hour, you're planting seeds of greatness that will grow throughout the day.</p>
            <p>This is your time to connect with your best self before the demands of the world come rushing in.</p>
            <p>Protect this hour fiercely. It's the foundation upon which an extraordinary life is built.</p>
            <p class="source-reference">Source: The 5 AM Club by Robin Sharma</p>`
  
                    }
        ]
    }
];
if (typeof books === 'undefined') {
    var books = [];
}
books = books.concat(personalDevelopmentBooks);
console.log('📚 Personal Development added. Total books:', books.length);