import "./index.scss";

interface HealthFactorDataProps {
  totalBorrow: number;
  totalLend: number;
  healthFactor: number;
}

const HealthFactorData: React.FC<HealthFactorDataProps> = ({
  totalBorrow,
  totalLend,
  healthFactor,
}) => (
  <div className='analytics'>
    <div>
      <span> Total Lend</span>
      {isNaN(totalLend) ? (
        <h3 className='paragraph04'>-</h3>
      ) : (
        <h3 className='paragraph04'>
          {totalLend !== undefined
            ? // ? "$" + Number(totalLend).toFixed(5)
              Number(totalLend).toFixed(5)
            : ""}
        </h3>
      )}
    </div>
    <div>
      <span>Total Borrow</span>
      {isNaN(totalBorrow) ? (
        <h3 className='paragraph04'>-</h3>
      ) : (
        <h3 className='paragraph04'>
          {totalBorrow !== undefined
            ? // ? "$ " + Number(totalBorrow).toFixed(5)
              Number(totalBorrow).toFixed(5)
            : ""}{" "}
        </h3>
      )}
    </div>
    <div>
      <span>Health Factor</span>
      {isNaN(totalLend) ? (
        <h3 className='paragraph04'>-</h3>
      ) : (
        <h3 className='paragraph04'>
          {healthFactor !== undefined ? Number(healthFactor) : ""}
        </h3>
      )}
    </div>
  </div>
);

interface HealthContainerProps {
  selectedTokens: any;
  totalBorrow: any;
  totalLend: any;
  healthFactor: any;
  showAccordion: boolean;
}

const PoolHealthContainer: React.FC<HealthContainerProps> = ({
  selectedTokens,
  totalBorrow,
  totalLend,
  healthFactor,
  showAccordion,
}) => {
  return (
    <>
      <div className='healthContainer'>
        <HealthFactorData
          totalBorrow={totalBorrow}
          totalLend={totalLend}
          healthFactor={healthFactor}
        />
      </div>
      {/* ) */}
    </>
  );
};

export default PoolHealthContainer;
