import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import './App.css';

import {  useState, useEffect } from 'react';
import { ethers } from "ethers";
import {ToastContainer, toast} from "react-toastify";

import WRHeader from 'wrcomponents/dist/WRHeader';
import WRFooter from 'wrcomponents/dist/WRFooter';
import WRInfo from 'wrcomponents/dist/WRInfo';
import WRContent from 'wrcomponents/dist/WRContent';
import WRTools from 'wrcomponents/dist/WRTools';

import Ebay from './artifacts/contracts/EbayChain.sol/EbayChain.json';
import { format6FirstsAnd6LastsChar, toDate } from "./Utils";

function App() {

  const [user, setUser] = useState({address: '', connected: false});
  
  const [auctions, setAuctions] = useState([]);
  const [myOffers, setMyOffers] = useState([]);

  const [offerValue, setOfferValue] = useState([]);

  const [auctionName, setAuctionName] = useState('');
  const [auctionDescription, setAuctionDescription] = useState('');
  const [auctionPrice, setAuctionPrice] = useState('');
  const [auctionDuration, setAuctionDuration] = useState('');

  const contractAddress ='0xEEdD816a041d157b569f0388a7A6b92Fc5cc0bDb';
  let contractDeployed = null;
  let contractDeployedSigner = null;

  async function getProvider(connect = false){
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      if (contractDeployed == null){
        contractDeployed = new ethers.Contract(contractAddress, Ebay.abi, provider)
      }
      if (contractDeployedSigner == null){
        contractDeployedSigner = new ethers.Contract(contractAddress, Ebay.abi, provider.getSigner());
      }
      if (connect && user.connected == false){
        let userAcc = await provider.send('eth_requestAccounts', []);
        setUser({address: userAcc[0], connected: true});
        const respOffers  = await contractDeployed.getUserOffers(userAcc[0]);  
        setMyOffers( respOffers)  
      }  
    } catch (error) {
      toastMessage(error.reason)
    }
  }

  async function handleConnect(){
    try {
      getData(true);
    } catch (error) {
      toastMessage(error.reason)
    }
  }

  async function disconnect(){
    try {
      setUser({address: '', connected: false});
      setMyOffers([])
    } catch (error) {
      
    }
  }
  
  useEffect(() => {
    getData()
  }, [])

  function toastMessage(text) {
    toast.info(text)  ;
  }

  async function getData(connect = false) {
    await getProvider(connect);
    
    if(contractDeployed){
      try {
        const respAllAuctions  = await contractDeployed.getAuctions();  
        setAuctions( respAllAuctions)  
      } catch (error) {
        toastMessage (error.reason);
      }
    }
  }

  async function handleCreateAuction(){
    await getProvider(true);
    try {
      const resp  = await contractDeployedSigner.createAuction(auctionName, auctionDescription, auctionPrice, (auctionDuration * 86400) );  
      toastMessage("Auction Created")
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  async function handleOffer(auctionId, valueOffer){
    await getProvider(true);
    try {
      const resp  = await contractDeployedSigner.createOffer(auctionId, { value: valueOffer});  
      toastMessage("Offer Created")
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  async function handleTrade(auctionId){
    await getProvider(true);
    try {
      const resp  = await contractDeployedSigner.trade(auctionId);  
      toastMessage("Traded")
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  return (
    <div className="App">
      <ToastContainer position="top-center" autoClose={5000}/>
      <WRHeader title="EBAY CHAIN" image={true} />
      <WRInfo chain="Goerli testnet" />
      <WRContent>
        {
          user.connected ==false ?<>
            <h2>Connect your wallet</h2>
            <button className="btn btn-primary col-3" onClick={handleConnect}>Connect</button>
            
          </>
          :<>
            <h2>User data</h2>
            <label>User account: {user.address}</label>
            <button className="btn btn-primary col-3" onClick={disconnect}>Disconnect</button>
            
            <hr/>
            <h2>Create Auction</h2>
            <input type="text" className="col-3 mb-1" placeholder="Name" onChange={(e) =>setAuctionName(e.target.value)} value={auctionName}/>
            <input type="text" className="col-3 mb-1" placeholder="Description" onChange={(e) =>setAuctionDescription(e.target.value)} value={auctionDescription}/>
            <input type="number" className="col-3 mb-1" placeholder="Min. price" onChange={(e) =>setAuctionPrice(e.target.value)} value={auctionPrice}/>
            <input type="number" className="col-3 mb-1" placeholder="Duration (in days)" onChange={(e) =>setAuctionDuration(e.target.value)} value={auctionDuration}/>
            <button className="btn btn-primary col-3" onClick={handleCreateAuction}>Create auction</button>

            <hr/>

            <h2>Your offers</h2>
            { !myOffers ? <> <label>You dont have any offer</label>
            </>:
            <>
              <table className="table">
                <thead>
                  <tr>
                    <td>Id</td>
                    <td>Auction Id</td>
                    <td>Price</td>
                  </tr>
                </thead>
                <tbody>
                  {myOffers.map((item, i) => 
                    <tr>
                      <td>{item.id.toString()}</td>
                      <td>{item.auctionId.toString()}</td>
                      <td>{item.price.toString()}</td>
                    </tr>
                  )
                  }
                </tbody>
              </table>
            </>}
          </>
        }

        <hr/>

        <h2>Auctions from all users</h2>
            {!auctions ? <label>No auctions to show</label>
          :
            <table className="table">
                <thead>
                <tr>
                    <td>Id</td>
                    <td>Seller</td>
                    <td>Name</td>
                    <td>Description</td>
                    <td>MinPrice</td>
                    <td>End Date</td>
                    <td>Best offer</td>
                    <td>Make offer</td>
                    <td>Action</td>
                    <td>Action</td>
                </tr>
                </thead>
                <tbody>
                { auctions.map ((item, ind) => 
                    <tr key={item.id.toString()}>
                      <td>{item.id.toString()}</td>
                      { item.seller.toLowerCase() == user.address.toLowerCase() ? 
                        <td> <label style={{backgroundColor: 'green', color: 'white', padding: 5, borderRadius: 5}}> You</label></td> :
                        <td>{format6FirstsAnd6LastsChar( item.seller)}</td>
                      }
                      <td>{item.name}</td>
                      <td>{item.description}</td>
                      <td>{item.minPrice.toString()}</td>
                      <td>{toDate(item.endDate.toString())}</td>
                      <td>{ item.bestOfferId.toString()}</td>
                      <td><input style={{maxWidth: 100}} type="number" placeholder='Offer Value' onChange={(e) => (offerValue[ind] = e.target.value)} value={setOfferValue[ind]} /></td>
                      <td><button className='btn btn-primary' onClick={() => handleOffer(item.id.toString(), offerValue[ind])}>Offer</button></td>
                      <td><button className='btn btn-primary' onClick={() => handleTrade(item.id.toString())}>Trade</button></td>
                    </tr>
                )}
                </tbody>
            </table> 
          } 
      </WRContent>
      <WRTools react={true} hardhat={true} bootstrap={true} solidity={true} css={true} javascript={true} infura={true} ethersjs={true} />
      <WRFooter />   
    </div>
  );
}

export default App;
