# Social Stakes
## Social Stakes provides a platform where friends can gather to play their favorite gambling games. Enjoy the rush of winning and the fun of social gaming all in one place. 


## Live Site

Explore and enjoy Social Stake directly from our [live site](http://socialstakes.onrender.com). 

## Table of Contents
 - [Live Site](http://socialstakes.onrender.com)
 - [Wiki](https://github.com/dcraderdev/SocialStakes/wiki)
 - [Projects](https://github.com/dcraderdev/SocialStakes/projects)
 - [Insights](https://github.com/dcraderdev/SocialStakes/pulse)
 - [Schema](https://github.com/dcraderdev/SocialStakes/wiki/Schema)
 - [API Docs](https://github.com/dcraderdev/SocialStakes/wiki/API-Routes)
 - [Terms of Service](https://github.com/dcraderdev/SocialStakes/wiki/Terms-of-Service)
 - [Fairness Policy](https://github.com/dcraderdev/SocialStakes/wiki/Fairness-Policy)
## Features

Social Stakes boasts many exciting features, including:


**Diverse Gaming Options**:
<br>
<br>
<img width="1165" alt="Screenshot 2023-08-17 at 4 43 00 PM" src="https://github.com/dcraderdev/SocialStakes/assets/90993510/76e39f51-8f52-499c-b68c-be64d5140dbf">

<br>

**Multi Table Action**: 
- Dive deeper into the gaming thrill with Social Stakes' advanced feature that allows players to simultaneously participate in up to 6 tables at once. Whether you're a strategist looking to maximize your chances or an enthusiast thirsty for continuous action, our platform ensures you never miss a beat. Seamlessly switch between tables, keep track of your games, and heighten your gameplay experience.
<br>
<br>
<img width="1151" alt="Screenshot 2023-08-17 at 5 34 41 PM" src="https://github.com/dcraderdev/SocialStakes/assets/90993510/a0a37cbf-e355-4b85-88a3-a79dad256f96">

<br>

**Private Tables**: 
- The ability for users to create and invite friends to private tables, turning every game into a private event.
<br>
<br>
<img width="1159" alt="Screenshot 2023-08-17 at 5 35 53 PM" src="https://github.com/dcraderdev/SocialStakes/assets/90993510/c33c42f4-b4a9-4a3a-8a85-9c205c720719">
<br>

**Live Chat**:
- An in-built chat feature for users to interact and engage in conversation while at the table.
<img width="1166" alt="Screenshot 2023-08-17 at 4 48 27 PM" src="https://github.com/dcraderdev/SocialStakes/assets/90993510/4265a80e-3b2e-4b36-8af1-cc6dfd917b1f">
<br>
<br>
<br>

**Start Private Conversation**: 
- Engage in one-on-one discussions or create group chats tailored for more intimate conversations. Whether it's strategizing or sharing a laugh, maintain your privacy with secure messaging.
<img width="1166" alt="Screenshot 2023-08-17 at 5 29 11 PM" src="https://github.com/dcraderdev/SocialStakes/assets/90993510/4974c0a6-73aa-48b8-a539-9fb931aa396a">
<br>
<br>
<br>

**Add Friends**: 
- Expand your network and enrich your gaming experience. With an intuitive 'Add Friend' option, it's now effortless to connect with fellow players and build your community. Whether it's someone you just played a memorable game with or an old pal, keep them close and game on together!
<img width="1167" alt="Screenshot 2023-08-17 at 5 30 11 PM" src="https://github.com/dcraderdev/SocialStakes/assets/90993510/3f9aee40-d1d0-4e1c-a0bf-a140ffd703de">
<br>
<br>

<br>
 
**User History**:
- Access to a player's past game actions for insightful strategy analysis. Coming soon!
<img width="805" alt="Screenshot 2023-08-17 at 5 55 58 PM" src="https://github.com/dcraderdev/SocialStakes/assets/90993510/bba6cde6-69ed-4940-9bad-112ec5d8e420">




## Technologies Used
- JavaScript
- Express
- PostgreSQL
- Redux
- React
- Blockchain
- Socket.io
- AWS
- 




## Challenges and Solutions
Building Social Stakes was an ambitious endeavor, blending traditional web development with the intricacies of live interaction and the transparency of blockchain technology. Below are the significant challenges faced during the development process and the corresponding solutions:

### Live Sockets & Instantaneous User Interactions
**Challenge:** 
Facilitating real-time interactions was paramount. Every user action, from adding a friend, starting a private conversation, making a bet, to joining a table, needed to be seen instantly by other users.

**Solution:** 
We integrated Socket.io with our React and Redux frontend, allowing for real-time bi-directional communication between the server and the web client. By doing so, any user's actions were seamlessly and immediately reflected across the platform for all relevant users.

### Game Integrity Using Blockchain
 **Challenge:** 
 Maintaining trust and ensuring game results weren't tampered with was crucial.

 **Solution:** 
 We employed a blockchain-based mechanism to guarantee the authenticity of our game results:

### Server Seed Generation:
The backend system pre-generated a series of server seeds. Each new seed is the SHA-256 hash of the prior seed, ensuring a connected chain of trust.

Announcing the Bitcoin Block: Before any gameplay, the system declared which future Bitcoin block hash would be the client seed. This transparent mechanism ensured that the seed was unpredictable.

Game Play: During the game, the predetermined server seed and the eventual Bitcoin block hash were used to generate game results. This combination ensured both unpredictability and verifiability.

Verification: Post-gameplay, players had the tools to verify the game's fairness by comparing seeds and verifying the client seed with the declared Bitcoin block.

### Real-time Data Management
**Challenge:**
Synchronizing game states, user actions, and platform interactions in real-time for all users, while ensuring performance wasn’t compromised.

**Solution:**
Leveraging the power of Redux for state management and Socket.io for real-time data synchronization, we created a system where any state change was instantly pushed to relevant users. This gave users a seamless gaming experience without any perceivable lag.

Scalable and Secure Backend
**Challenge:** 
With the influx of user data, bet actions, and real-time interactions, our backend had to be both scalable and secure.

**Solution:** 
By using Express with PostgreSQL as the database and deploying on AWS, we ensured scalability. Express managed routes and middleware efficiently, while PostgreSQL provided a robust system for data storage. Furthermore, AWS's cloud infrastructure allowed for on-demand scaling based on user loads.

User Authentication and Safety
**Challenge:** 
Establishing a system that securely managed user data, provided authentication, and kept user interactions confidential.

**Solution:** 
We used a combination of hashed passwords, Socket.io secure transmissions, and Express session management to ensure users' data was secure and their interactions remained private.

### Conclusion
Building Social Stakes was a culmination of multiple cutting-edge technologies: JavaScript, Express, PostgreSQL, Redux, React, Blockchain, Socket.io, and AWS. Each played a pivotal role in addressing the challenges of real-time gaming, user interactivity, and game integrity. The result is a platform that not only entertains but does so with transparency and trustworthiness.



## SOCIAL STAKES TERMS OF SERVICE

### Social Stakes is intended for entertainment purposes only.
You must be at least 18 years of age to access any service offered by Social Stakes.
Any stakes obtained through playing games hosted by Social Stakes are understood to be for increasing in-game wealth only.
Any stakes obtained are for the sole purpose of gameplay within Social Stakes.
Any other use of the stakes attempted or realized is outside of the accepted Terms of Service and will lead to immediate termination of your Social Stakes profile and forfeiture of any current balance that is held.
Social Stakes assumes no liability for any loss, whether monetary or virtual.
It is your responsibility as a user of Social Stakes to read the Terms of Service before accessing the site on each visit.

All bets and transactions are final.
If using Social Stakes is illegal for you in your jurisdiction, you are forbidden from using the site.
If you do not agree to any of our Terms of Service it is your responsibility to leave Social Stake.

### SOCIAL STAKES CODE OF CONDUCT

Do not harass or cause distress to other users, and refrain from any form of bullying or offensive behavior towards users/site staff.
Cooperate with moderators and admins.
Scams and theft are strictly prohibited.
Avoid posting spam or offensive messages.
Support other users, especially newcomers, with navigating the site and settling in.
In case of a dispute with another user, use the appropriate features to report or block them.
We do not allow the selling of anything via Social Stakes. Social Stakes is not a trading site.
Never publish personally identifiable information about yourself or other Social Stakes users.

### SOCIAL STAKES DEFECT POLICY

If you discover any bug or technical problem in Social Stakes, please report it.
If you believe your game had a bug or malfunction you have two weeks to report the malfunction or it is considered void for refund.
Depending on the severity of the bug, you may be eligible for a bug bounty.
When addressing a potential problem, we rely strictly on evidence. For this purpose, we log all user activities.
If your bug report cannot be reproduced and cannot be corroborated by our internal data, we require screenshots or other means to diagnose the problem.
If a bug report is directly contradicted by our data logs, it will not be accepted.

### SOCIAL STAKES PRIVACY POLICY

We do not share your information with any 3rd parties. We may, however, use 3rd-party analytics software to improve our service.
All information collected and stored by Social Stakes is used only by Social Stakes. Any breach of security will be disclosed and users affected will be made aware.
We keep detailed log files of all user activities for about two months, for fraud detection and the improvement of the service.
