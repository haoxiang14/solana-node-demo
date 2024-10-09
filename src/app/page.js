"use client";

import React, { useEffect, useState, useRef } from "react";

import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import * as echarts from "echarts";
import { LinkPreview } from "@/components/ui/link-preview";
import {
  IconClipboardCopy,
  IconFileBroken,
  IconWallet,
  IconTransfer,
  IconUserCheck,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHeader, 
  TableHead, 
  TableRow 
} from "@/components/ui/table"; 
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// import PieChart from "@/components/piechart";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Connection, PublicKey } from '@solana/web3.js';
// import { TOKEN_PROGRAM_ID } from '@solana/spl-token';


const RPC = `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`;
const connection = new Connection(RPC);

const GridItem = ({ icon, title, description, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div 
      className={`
        bg-white rounded-2xl p-6 flex flex-col items-center text-center 
        cursor-pointer transition-all duration-300 ease-in-out
        ${isHovered ? 'transform scale-105' : ''}
        ${isHovered ? 'shadow-lg' : 'shadow-md'}
        hover:bg-gray-50
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        text-gray-600 mb-4 transition-transform duration-300
        ${isHovered ? 'transform scale-110' : ''}
      `}>
        {icon}
      </div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default function Home() {

  const [activeComponent, setActiveComponent] = useState(null);
  const [accountInfo, setAccountInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [tokenHoldings, setTokenHoldings] = useState([]);
  const [solanaPrice, setSolanaPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchWalletData();
  }, []);

  async function fetchWalletData() {
    setIsLoading(true);
    try {
      const publicKey = new PublicKey("MJKqp326RZCHnAAbew9MDdui3iCKWco7fsK9sVuZTX2");
      
      // Fetch account info
      const info = await connection.getAccountInfo(publicKey);

      const solanaPrice = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const solanaPriceData = await solanaPrice.json();
      setSolanaPrice(solanaPriceData.solana.usd);

      //fetch token holdings
      const tokenHoldings = await fetch(process.env.NEXT_PUBLIC_HELIUS_RPC_URL + '/?api-key=' + process.env.NEXT_PUBLIC_HELIUS_API_KEY, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "jsonrpc": "2.0",
            "id": "",
            "method": "getAssetsByOwner",
            "params": {
              "ownerAddress": publicKey,
              "page": 1,
              "limit": 100,
              "sortBy": {
                "sortBy": "created",
                "sortDirection": "desc"
              },
              "options": {
                "showUnverifiedCollections": false,
                "showCollectionMetadata": true,
                "showGrandTotal": true,
                "showFungible": true,
                "showNativeBalance": true,
                "showInscription": false,
                "showZeroBalance": false
              }
            }
          }),
      });
      const tokenData = await tokenHoldings.json();
      const fungibleTokens = tokenData.result.items.filter(token => 
        token.interface === 'FungibleToken' && 
        token.token_info && 
        token.token_info.price_info && 
        token.token_info.price_info.price_per_token !== undefined &&
        token.token_info.symbol !== 'KURT'
      );
      console.log(fungibleTokens);
      setTokenHoldings(fungibleTokens);

      // Fetch transactions
      const transactions = await connection.getSignaturesForAddress(publicKey);
      setTransactions(transactions);
      console.log(transactions);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleItemClick = (component) => {
    setActiveComponent(component);
  };

  if (isLoading) return <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
      <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-gray-700">Loading data...</p>
    </div>
  </div>;
  if (error) return <div>Error: {error}</div>;

  return (
    (
    <div className="flex flex-col justify-center text-center">
      <div className="my-8">
         
        <div className="flex justify-center mb-4">
          <div className="bg-blue-500 rounded-xl py-3 px-6 inline-block">
            <p className="text-white text-xl font-bold">Overview of Account:</p>
          </div>
        </div>
        <div className="flex items-center justify-center"> 
          <p className="text-lg text-gray-600 pr-2 hover:text-blue-400"> 
            <LinkPreview 
              url="https://solscan.io/account/MJKqp326RZCHnAAbew9MDdui3iCKWco7fsK9sVuZTX2"
              className="inline-block"
            > 
              MJKqp326RZCHnAAbew9MDdui3iCKWco7fsK9sVuZTX2
            </LinkPreview>
          </p>
          {/* <IconClipboardCopy size={24} className="inline-block" /> */}
        </div>
        {/* <LinkPreview 
          url="https://solscan.io/account/MJKqp326RZCHnAAbew9MDdui3iCKWco7fsK9sVuZTX2"
          className="inline-block"
        > 
           <TextGenerateEffect words="MJKqp326RZCHnAAbew9MDdui3iCKWco7fsK9sVuZTX2"/>
        </LinkPreview> */}
      </div>
      <div className="flex gap-2">
          <GridItem
            title="Account Details"
            description="View details of the Solana wallet account."
            // header={<Skeleton/>}
            icon={<IconUserCheck size={36} />}
            className={"h-[150px] border border-slate-300"}
            onClick={() => handleItemClick("AccountDetails")}
          />
          <GridItem
            title="Portfolio Details"
            description="View portolio details of the Solana wallet."
            icon={<IconWallet size={36} />}
            className={"h-[150px] border border-slate-300"}
            onClick={() => handleItemClick("PortfolioDetails")}
          />
          <GridItem
            title="Trasaction Details"
            description="View transaction details of the Solana wallet."
            icon={<IconTransfer size={36} />}
            className={"h-[150px] border border-slate-300"}
            onClick={() => handleItemClick("TransactionDetails")}
          />
      </div>

      { activeComponent === "AccountDetails" && <AccountDetails accountInfo={accountInfo} tokenHoldings={tokenHoldings} solanaPrice={solanaPrice} /> }
      { activeComponent === "PortfolioDetails" && <PortfolioDetails accountInfo={accountInfo} tokenHoldings={tokenHoldings} solanaPrice={solanaPrice} />}
      { activeComponent === "TransactionDetails" && <TransactionDetails transactions={transactions} /> }

    </div>
   )
  );
}

const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
);


const AccountDetails = ({ tokenHoldings, solanaPrice, accountInfo }) => {
  const solBalance = accountInfo ? (accountInfo.lamports / 1e9).toFixed(9) : 0;
  const solValue = accountInfo && solanaPrice ? (accountInfo.lamports / 1e9 * solanaPrice) : 0;

  // Calculate total value of other tokens
  const tokenValue = tokenHoldings.reduce((total, token) => {
    return total + parseFloat(token.token_info.price_info.total_price || 0);
  }, 0);

  // Calculate total account value
  const totalValue = solValue + tokenValue;
  return (
    <div>
      <div className="flex justify-left mt-4">
        <div className="bg-blue-500 rounded-xl py-2 px-4 inline-block">
          <p className="text-white font-bold"> Account Details: </p>
        </div>
      </div>
      <Card className="w-full mt-4 py-4">
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4 ">
              <div>
                <Label htmlFor="account-address" className="text-left mb-1 font-bold block">Account Address</Label>
                <Input 
                  id="account-address"
                  value="MJKqp326RZCHnAAbew9MDdui3iCKWco7fsK9sVuZTX2" 
                  readOnly
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="account-sol" className="text-left mb-1 font-bold block"> SOL Balance </Label>
                <Input 
                  id="account-sol"
                  value={`${accountInfo ? accountInfo.lamports / 1e9 : 'N/A'} SOL`}
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="account-usd" className="text-left mb-1 font-bold block">Account Total Balance (USD)</Label>
                <Input 
                  id="account-usd"
                  value={`$${totalValue.toFixed(2)}`}
                  readOnly
                />
              </div>
            </div>
            <div>
              <PieChart 
                tokenHoldings={tokenHoldings} 
                solanaPrice={solanaPrice} 
                accountInfo={accountInfo} 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PortfolioDetails = ({ accountInfo, tokenHoldings, solanaPrice }) => (
  <div>
    <div className="flex justify-left mt-4">
      <div className="bg-blue-500 rounded-xl py-2 px-4 inline-block">
        <p className="text-white font-bold"> Portfolio: </p>
      </div>
    </div>
    <div className="mt-4 w-full overflow-auto h-[300px]">
      <Table className="border border-slate-300 rounded-lg">
        <TableCaption>A list of tokens</TableCaption>
        <TableHeader className="bg-gray-200">
          <TableRow>
            <TableHead className="text-left font-bold">Token</TableHead>
            <TableHead className="text-right font-bold">Balance</TableHead>
            <TableHead className="text-right font-bold">Price (USD) </TableHead>
            <TableHead className="text-right font-bold">Value (USD) </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white">
          <TableRow>
            <TableCell className="font-medium flex items-center gap-2">
              <Avatar>
                <AvatarImage className="w-8 h-8" src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" />
              </Avatar>
              <p> SOL </p>
            </TableCell>
            <TableCell className="text-right"> { (accountInfo.lamports / 1000000000).toFixed(8)} </TableCell>
            <TableCell className="text-right"> $ {solanaPrice}</TableCell>
            <TableCell className="text-right"> $ {(solanaPrice*(accountInfo.lamports / 1000000000).toFixed(8)).toFixed(2)} </TableCell>
          </TableRow>

          {tokenHoldings.map((token, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={token.content.links.image} alt={token.token_info.symbol} />
                  </Avatar>
                  <p>{token.token_info.symbol}</p>
                </TableCell>
                <TableCell className="text-right">{(token.token_info.balance / Math.pow(10, token.token_info.decimals)).toFixed(4)}</TableCell>
                <TableCell className="text-right">$ {(token.token_info.price_info.price_per_token).toFixed(8)}</TableCell>
                <TableCell className="text-right">$ {(token.token_info.price_info.total_price).toFixed(4)}</TableCell>
              </TableRow>
            ))}
        </TableBody>
          
      </Table>
    </div>
  </div>
);

const TransactionDetails = ({ transactions }) => (
  <div>
    <div className="flex justify-left mt-4">
      <div className="bg-blue-500 rounded-xl py-2 px-4 inline-block">
        <p className="text-white font-bold"> Transactions: </p>
      </div>
    </div>
    <div className="w-full mt-4 overflow-auto h-[300px]">
      <Table className="border border-slate-300 rounded-lg">
      <TableCaption>Recent transactions</TableCaption>
      <TableHeader className="bg-gray-200">
        <TableRow>
          <TableHead className="text-left font-bold">Signature</TableHead>
          <TableHead className="text-left font-bold"> Date Time </TableHead>
          <TableHead className="text-right font-bold"> Status </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="bg-white">
        {transactions.map((transaction, index) => (
          <TableRow key={index}>
            <TableCell className="text-left"> 
              <a className="hover:text-blue-500 transition duration-200" href={`https://solscan.io/tx/${transaction.signature}`} target="_blank" rel="noopener noreferrer">
                {transaction.signature.slice(0, 20)}...{transaction.signature.slice(-20)}
              </a>
            </TableCell>
            <TableCell className="text-left"> {new Date(transaction.blockTime * 1000).toLocaleString()} </TableCell>
            <TableCell className="text-right"> 
              
              <Badge>
                {transaction.confirmationStatus}
              </Badge>
              
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      </Table>
    </div>
  </div>
  
);

const PieChart = ({tokenHoldings, solanaPrice, accountInfo}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    let chart;
    if (chartRef.current) {
      chart = echarts.init(chartRef.current);

      const data = tokenHoldings.map(token => ({
        name: token.token_info.symbol,
        value: token.token_info.price_info.total_price
      }));

      const solBalance = accountInfo.lamports / 1e9;
      const solValue = solBalance * solanaPrice;
      data.push({
        name: 'SOL',
        value: solValue.toFixed(2)
      });


      const option = {

        title: {
          text: 'Token Distribution',
          left: 'center',
          top: '5%',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },

        tooltip: {
          trigger: 'item'
        },
        legend: {
          top: '5%',
          left: 'center',
          show: false
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 40,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: data
          }
        ]
      };
      chart.setOption(option);
    }

    return () => {
      if (chart) {
        chart.dispose();
      }
    };
  }, [tokenHoldings, solanaPrice, accountInfo]);

  return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />;
};
