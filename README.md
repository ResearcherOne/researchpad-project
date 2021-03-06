# ResearchPad Project
- The project is developed using ElectronJs.
- There are two application that runs in ElectronJs: src-backend & src-frontend
 - Application is strictly seperated as backend and front-end for possibility of moving "backend" into a real backend instead of running a background process while user interacts with the front-end.
 - Backend and frontend is communicating using HTTP-Request like communication with a library written specifically for this application that make use of inter-process communication. It is very easy to switch to real backend-frontend style application.
 
# Screenshots
- Search Google Scholar (or ARXIV by changing current search platform global variable from front-end application), drag&drop listed document to your Knowledge Map to add it to your research project.

![alt text](https://github.com/ResearcherOne/researchpad-project/blob/develop/images/01-root-node.png?raw=true)

- ResearchPad will fetch top 10 cited papers that cites the paper you put on your knowledge map OR if it is an Arxiv Computer Science paper, it will fetch all biblography data (citation & references) from Semantic Scholar and make it available for you to view.

![alt text](https://github.com/ResearcherOne/researchpad-project/blob/develop/images/02-citation-node.png?raw=true)

- You can drag & drop child nodes in order to add them to your Knowledge Map so that hey become a root node as well!

![alt text](https://github.com/ResearcherOne/researchpad-project/blob/develop/images/03-citation-to-root.png)

- You can go even deeper in the literature by taking look at child nodes of child nodes of child nodes of the root node you've started in the beginning!

![alt text](https://github.com/ResearcherOne/researchpad-project/blob/develop/images/04-go-deeper.png)

# Project Team:
- Andrew Camps: Our 10x software engineer guy.
- Ogulcan Cingiler: Take cares of backend, data fetching, data parsing and whatever else needed to make ResearchPad project come reality.
- Emre Ay: Anything that is non technical is handled by Emre. Talking with researchers, data analysis, etc.
- Birkan Kolcu: Mostly creating new features needed, software architecture (sorry for messing up with front-end), prioritization of features and coding hard.

# Credits
- This project is initiated by Birkan Kolcu as a frustration stem from the fact that none of the commercial research management softwares out there didn't provide visualization/mind mapping capability integrated with academic web content.

# This project is not maintained anymore.
- Unfortunately we do not maintain the project anymore. Hope this project will be useful for some folks out there to create cool projects.
- If you are sad, and really wanted to actually use a research mind-mapping tool you should probably check out Docear project that would be probably useful for your PhD.
