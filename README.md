# ✨ Serve & Shine 🕊✨
![photo_5334763846432312893_x](https://github.com/SarahAbuirmeileh/Serve-and-Shine/assets/127017088/704c3d0b-b725-48d2-80a0-d785ba13aa61)



> **Team Members: 👩🏻‍💻**
>
> + Sarah Abu irmeileh
>
> + Tarteel Tamimi

## **Overview:💎**

Our project is an online tool designed to connect people who want to volunteer their time and skills with organizations and projects that need help. It acts as a virtual bridge, making it simple for volunteers to find valuable opportunities and for organizations to efficiently manage their volunteers, and hence put the right person in the right place. This platform contributes to the humanitarian sector by improving the volunteer experience and increasing the impact of volunteer efforts.

## General information 📑

### Key Features: 🔑🎯

1. **User Authentication and Profiles:**
    - Users can register and create profiles. Two primary user roles are supported: volunteers(normal, premium) and organizations.
    - Volunteers provide information about their skills, interests, availability, and preferred causes or activities.
    - Organizations create profiles detailing their mission, goals, and the types of volunteer opportunities they offer.
2. **Volunteer Opportunity Listings:**
    - Organizations can post volunteer opportunities, including details such as location, time commitments, required skills, and the expected impact of the volunteer work.
    - Opportunities are categorized by type (place, time, skills needed…).
3. **Skill Matching Algorithm:**
    - The platform employs a sophisticated matching algorithm that pairs volunteers with opportunities based on their skills, interests, and availability.
    - Volunteers can message the organization if they lack the needed skills for a specific opportunity, promoting communication and collaboration.
    - Volunteers receive personalized recommendations for volunteer positions that align with their preferences.
5. **Feedback and Ratings:**
    - Both volunteers and organizations have the ability to provide feedback and ratings after each volunteer engagement.
    - This system fosters accountability and trust within the community.
6. **Recommendation**: 
    - recommend voluntary work for volunteers according to skills and location.
7. **Logger**
    - The Logger captures significant events within the platform, such as user registrations, login attempts, volunteer opportunity postings.
    - Error logs contain information about the type of error
8. **Unite testing**
    - Unit tests cover specific functions, methods, or modules of your application, including those related to user authentication, skill matching, and messaging.
9. **Error Handling:** 
    - Implement robust error handling to provide meaningful error messages to users and log errors for debugging.

### Humanitarian Impact: 🕊

This  Platform empowers individuals to actively contribute to humanitarian causes and community development. It strengthens the volunteer ecosystem by making volunteering more accessible, transparent, and efficient. By facilitating meaningful connections between volunteers and organizations, it amplifies the positive impact of volunteer initiatives in various sectors, including disaster relief, education, healthcare, and social welfare.

### Scalability: 🌍

The platform is designed to accommodate a growing number of volunteers and organizations. It leverages AWS infrastructure and scalable database solutions to ensure smooth operation even as the user base expands.

### Security and Privacy: 🔐

Data security and privacy are paramount. The platform implements robust access controls, encryption, and regular security audits to safeguard sensitive user information.

### CI / CD: 💻

Following best practices in continuous delivery, the platform remains up-to-date and reliable, ensuring a seamless experience for volunteers and organizations.

**This Platform represents a powerful humanitarian project idea that can have a lasting positive impact on communities by promoting volunteerism and facilitating volunteer efforts. It brings people together to make a meaningful difference in the world.**


## Technical information 👩🏻‍💻
### Development
1. Entities: 🗃

   ![image](https://github.com/SarahAbuirmeileh/Serve-and-Shine/assets/127000629/d31ff035-c662-4454-868d-7cb7e37de76b)

2. Documentation: 📚


### Deployment pocess: 💻
![Screenshot from 2023-10-31 08-25-42](https://github.com/SarahAbuirmeileh/test/assets/127017088/a7480af5-0190-468d-b979-6b0857f49931)

### AWS services:🔥
![Screenshot from 2023-10-31 08-27-43](https://github.com/SarahAbuirmeileh/test/assets/127017088/37fd9c79-485c-4c16-b0f5-d955ebdae43d)


## Usage & Setup Instructions: 👩🏻‍💻📑

1. Clone the repository using this command <br>
    `git clone https://github.com/SarahAbuirmeileh/Serve-and-Shine`

2. Install dependencies using this command<br>
    `npm install`

3. Create a database (Choose it's name and store it in .env)

4. Set up environment variables:
    4.1 Create .env file
    4.2 Add to it these environment variables:
    ```
    PORT=          # Port to run the server, example 3000
    SECRET_KEY=    # Choose one to encrypt the password
    DB_HOST=       # The database host, if locally may be localhost
    DB_PORT=       # Example 3306 
    DB_USERNAME=   # According to your database connection
    DB_PASSWORD=   # According to your database connection
    DB_NAME=       # According to your database, example Serve-and-Shine
    AWS_ACCESS_KEY_ID=  # From this to the end are data related to your AWS account
    AWS_SECRET_ACCESS_KEY=
    AWS_REGION=
    AWS_BUCKET_NAME=
    AWS_CERTIFICATES_BUCKET_NAME=
    ```
5. Build the application using this command:<br>
`npm run dev`

**🔥And finally you can access this incredible project, if you run it locally using port 3000, the requests basically should be sent to** <br>
`http://localhost:3000/`  

## Api Documentations: 📚
You can learn more about Api for this project if you visit this (after cloning the project and do the previos steps)<br>
`http://localhost:3000/api-docs/`


## Note: 🚫
After Nov 2024, all AWS services won't be available 