import { MutatingDots } from "react-loader-spinner";

export default function MutatingLoadingSpinner({color="white"}) {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <MutatingDots
                visible={true}
                height="100"
                width="100"
                color={color}
                secondaryColor="white"
                radius="12.5"
                ariaLabel="mutating-dots-loading"
                wrapperStyle={{}}
                wrapperClass=""
            />
        </div>
    );
}