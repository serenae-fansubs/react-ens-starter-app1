import { useState } from 'react';
import { ethers } from 'ethers';
import './Wallet.css';

function Wallet() {
    const [provider, setProvider] = useState();
    const [address, setAddress] = useState();
    const [ensName, setEnsName] = useState();
    const [avatar, setAvatar] = useState();
    const [otherRecords, setOtherRecords] = useState({});
    
    const connect = async () => {
        let prov = provider;
        if (!prov) {
            prov = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(prov);
        }

        let address, ensName, avatar;
        let otherRecords = {};
        
        await prov.send("eth_requestAccounts", []);
        const signer = prov.getSigner();
        if (signer) {
            address = await signer.getAddress();
            ensName = await prov.lookupAddress(address);
            if (ensName) {
                avatar = await prov.getAvatar(ensName);

                const resolver = await prov.getResolver(ensName);
                if (resolver) {
                    otherRecords.email = await resolver.getText('email');
                    otherRecords.url = await resolver.getText('url');
                    otherRecords.twitter = await resolver.getText('com.twitter');
                }
            }
        }

        setAddress(address);
        setEnsName(ensName);
        setAvatar(avatar);
        setOtherRecords(otherRecords);
    };

    const disconnect = () => {
        setAddress('');
        setEnsName('');
        setAvatar('');
        setOtherRecords({});
    };

    if (address) {
        return <div>
            <div className="wallet">
                {avatar && (<img src={avatar} alt="avatar"></img>)}
                <span>{ensName || address}</span>
                <button className="wallet-disconnect" onClick={disconnect}>✖</button>
            </div>
            <div>
                {otherRecords.email && (<p>Email: <a href={`mailto:${otherRecords.email}`}>{otherRecords.email}</a></p>)}
                {otherRecords.url && (<p>Website: <a href={otherRecords.url}>{otherRecords.url}</a></p>)}
                {otherRecords.twitter && (<p>Twitter: <a href={`https://twitter.com/${otherRecords.twitter}`}>@{otherRecords.twitter}</a></p>)}
            </div>
        </div>;
    } else {
        return <button className="wallet-connect" onClick={connect}>Connect Wallet</button>;
    }
}

export default Wallet;
