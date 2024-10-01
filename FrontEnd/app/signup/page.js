import Signup from "/components/Login/Signup";
  
  export default async function SignupPage({}) {
    return (
      <div className="text-white h-screen flex justify-center items-center bg-cover"
      style={{"backgroundImage":"url('./login2.jpg"}}>
        <Signup/>
      </div>
    );
  }