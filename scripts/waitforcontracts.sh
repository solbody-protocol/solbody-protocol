while [ ! -f "${HOME}/.solbody/solbody-contracts/artifacts/ready" ]; do
  sleep 2
done

cat "barge/start_solbody.log"
ls -lh "${HOME}/.solbody/solbody-contracts/"
ls -lh "${HOME}/.solbody/solbody-contracts/artifacts/"
cat "${HOME}/.solbody/solbody-contracts/artifacts/address.json"
